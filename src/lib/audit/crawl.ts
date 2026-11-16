import { extractPage } from "./extract";
import { aiCrawlerAccess, isAllowed, parseRobots, parseSitemap, type RobotsFile } from "./robots";
import { ROBOTS_TOKEN } from "./net";
import {
  AuditError,
  type AuditProgress,
  type CrawlResult,
  type FetchLogEntry,
  type Fetcher,
  type PageData,
  type StageKey,
} from "./types";
import { assertPublicHttpUrl, sameSite } from "./url";

export interface CrawlLimits {
  maxPages: number;
  requestTimeoutMs: number;
  maxBytesPerPage: number;
  totalBudgetMs: number;
  concurrency: number;
}

export const FREE_AUDIT_LIMITS: CrawlLimits = {
  maxPages: 10,
  requestTimeoutMs: 8000,
  maxBytesPerPage: 1_500_000,
  totalBudgetMs: 40_000,
  concurrency: 3,
};

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|ico|css|js|json|xml|zip|mp4|mp3|mov|avi|docx?|xlsx?|pptx?|woff2?|ttf|txt)$/i;
const SKIP_PATH = /\/(wp-admin|wp-login|wp-json|cart|checkout|my-account|account|login|signin|sign-in|register|feed|tag|author|search|cdn-cgi)(\/|$)/i;

const PRIORITY: [RegExp, number][] = [
  [/\b(services?|what-we-do|solutions)\b/i, 10],
  [/\b(about|our-story|company|team|who-we-are)\b/i, 8],
  [/\b(contact|get-in-touch|request|quote|estimate|schedule|book)\b/i, 8],
  [/\b(faq|faqs|frequently-asked|questions)\b/i, 7],
  [/\b(reviews?|testimonials?)\b/i, 6],
  [/\b(areas?|locations?|service-area|cities|where-we-serve)\b/i, 6],
  [/\b(pricing|prices|rates|cost|financing)\b/i, 5],
  [/\b(repair|installation|install|replacement|maintenance|emergency|residential|commercial)\b/i, 5],
  [/\b(blog|news|articles?|posts?)\b/i, -3],
  [/\b(privacy|terms|sitemap|careers|jobs)\b/i, -6],
];

function scoreCandidate(url: URL, text: string): number {
  const haystack = `${decodeURIComponent(url.pathname)} ${text}`.replace(/[_/]/g, " ");
  let score = 0;
  for (const [re, weight] of PRIORITY) if (re.test(haystack)) score += weight;
  const depth = url.pathname.split("/").filter(Boolean).length;
  score -= Math.max(0, depth - 1) * 2;
  if (url.search) score -= 4;
  if (/\/\d{4}\/\d{2}\//.test(url.pathname)) score -= 6; // dated blog posts
  return score;
}

/** Most pages one section of a site (e.g. /service-area/) may take in the first pass. */
const MAX_PER_SECTION = 3;

function sectionOf(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  // A top-level page is its own section; nested pages group under their first folder.
  return parts.length > 1 ? parts[0].toLowerCase() : `/${(parts[0] ?? "").toLowerCase()}`;
}

/**
 * Take the highest-scoring pages, but stop any single section from crowding out
 * the rest. A site with 40 city pages should still have its services, about and
 * contact pages read. Leftover slots are filled by score.
 */
export function pickDiverse<T extends { url: string; score: number }>(sorted: T[], max: number): T[] {
  const picked: T[] = [];
  const overflow: T[] = [];
  const perSection = new Map<string, number>();
  for (const c of sorted) {
    if (picked.length >= max) break;
    const section = sectionOf(c.url);
    const used = perSection.get(section) ?? 0;
    if (used >= MAX_PER_SECTION) {
      overflow.push(c);
      continue;
    }
    perSection.set(section, used + 1);
    picked.push(c);
  }
  for (const c of overflow) {
    if (picked.length >= max) break;
    picked.push(c);
  }
  return picked;
}

function canonicalKey(u: URL): string {
  const path = u.pathname.replace(/\/+$/, "") || "/";
  return `${u.hostname.replace(/^www\./, "")}${path}${u.search}`.toLowerCase();
}

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await fn(items[next++]);
  });
  await Promise.all(workers);
}

export interface CrawlOptions {
  startUrl: string;
  fetcher: Fetcher;
  limits?: CrawlLimits;
  onProgress?: (progress: AuditProgress) => void | Promise<void>;
}

/**
 * Crawls a small, prioritized set of public pages from one website.
 * Honors robots.txt, stays on the starting site, and never runs page scripts.
 */
export async function crawlSite(options: CrawlOptions): Promise<CrawlResult> {
  const { fetcher } = options;
  const limits = options.limits ?? FREE_AUDIT_LIMITS;
  const deadline = Date.now() + limits.totalBudgetMs;
  const fetchLog: FetchLogEntry[] = [];
  const done: StageKey[] = ["validate"];
  let pagesFetched = 0;
  let pagesPlanned = 1;

  const report = async (stage: StageKey) => {
    await options.onProgress?.({ stage, stagesDone: [...done], pagesFetched, pagesPlanned });
  };
  const timeLeft = () => Math.max(0, deadline - Date.now());
  const get = async (url: string, accept?: string, maxBytes = limits.maxBytesPerPage) => {
    const started = Date.now();
    try {
      const res = await fetcher(url, {
        timeoutMs: Math.min(limits.requestTimeoutMs, Math.max(1000, timeLeft())),
        maxBytes,
        accept,
      });
      fetchLog.push({ url, status: res.status, ms: res.elapsedMs, bytes: res.bytes, note: res.truncated ? "truncated at size limit" : undefined });
      return res;
    } catch (err) {
      fetchLog.push({ url, status: null, ms: Date.now() - started, bytes: 0, note: err instanceof Error ? err.message : "failed" });
      throw err;
    }
  };

  const loadRobots = async (origin: string) => {
    try {
      const res = await get(`${origin}/robots.txt`, "text/plain,*/*;q=0.5", 500_000);
      if (res.status >= 500) return { file: null, status: "error" as const, http: res.status };
      // A robots.txt that is really an HTML page (soft 404) counts as missing.
      if (res.status >= 400 || /<html[\s>]/i.test(res.body.slice(0, 500))) {
        return { file: parseRobots(""), status: "missing" as const, http: res.status };
      }
      return { file: parseRobots(res.body), status: "found" as const, http: res.status };
    } catch (err) {
      return { file: null, status: "error" as const, http: null, cause: err };
    }
  };

  // --- robots.txt ---------------------------------------------------------
  await report("robots");
  let startUrl = options.startUrl;
  let origin = new URL(startUrl).origin;
  let robots: Awaited<ReturnType<typeof loadRobots>> = await loadRobots(origin);
  if ("cause" in robots && startUrl.startsWith("https://")) {
    // Nothing answered over HTTPS. Many small-business sites still lack it, so try http once.
    const httpUrl = startUrl.replace(/^https:/, "http:");
    const retry = await loadRobots(new URL(httpUrl).origin);
    if (!("cause" in retry)) {
      startUrl = httpUrl;
      origin = new URL(httpUrl).origin;
      robots = retry;
    }
  }
  // A network-level failure means the site itself is unreachable, not that robots.txt forbids us.
  if ("cause" in robots) {
    throw robots.cause instanceof AuditError ? robots.cause : new AuditError("UNREACHABLE", "We couldn't connect to that website.");
  }

  const assertCrawlable = (r: typeof robots, path: string) => {
    if (r.status === "error") {
      throw new AuditError(
        "ROBOTS_DISALLOWED",
        "This site's robots.txt could not be read (server error), so we did not crawl it. Standard crawler rules treat that as a request not to crawl.",
      );
    }
    if (r.file && !isAllowed(r.file, ROBOTS_TOKEN, path)) {
      throw new AuditError("ROBOTS_DISALLOWED", "This site's robots.txt asks crawlers not to access it, so we did not audit it.");
    }
  };
  assertCrawlable(robots, "/");

  // --- homepage -----------------------------------------------------------
  const home = await get(startUrl);
  if (home.status >= 400) {
    throw new AuditError("UNREACHABLE", `The homepage returned an error (HTTP ${home.status}).`);
  }
  if (!home.contentType.includes("html") && !/<html[\s>]/i.test(home.body.slice(0, 2000))) {
    throw new AuditError("NOT_HTML", "That address did not return a web page.");
  }

  const finalOrigin = new URL(home.finalUrl).origin;
  if (finalOrigin !== origin) {
    origin = finalOrigin;
    robots = await loadRobots(origin);
    assertCrawlable(robots, new URL(home.finalUrl).pathname);
  }
  const robotsFile: RobotsFile = robots.file ?? parseRobots("");

  // --- sitemap ------------------------------------------------------------
  const sitemapUrls: string[] = [];
  let sitemapFound: string | null = null;
  const sitemapCandidates = [...robotsFile.sitemaps.slice(0, 2), `${origin}/sitemap.xml`];
  for (const candidate of [...new Set(sitemapCandidates)]) {
    if (sitemapFound || timeLeft() < 5000) break;
    try {
      assertPublicHttpUrl(candidate);
      const res = await get(candidate, "application/xml,text/xml,*/*;q=0.5", 2_000_000);
      if (res.status !== 200 || !/<(urlset|sitemapindex)[\s>]/i.test(res.body)) continue;
      const parsed = parseSitemap(res.body);
      sitemapFound = candidate;
      if (!parsed.isIndex) {
        sitemapUrls.push(...parsed.urls);
        continue;
      }
      // Prefer page sitemaps over post/category sitemaps, and read at most two.
      const children = parsed.urls
        .filter((u) => sameSite(u, origin))
        .sort((a, b) => Number(/post|blog|tag|categor|author/i.test(a)) - Number(/post|blog|tag|categor|author/i.test(b)))
        .slice(0, 2);
      for (const child of children) {
        if (timeLeft() < 5000) break;
        try {
          const sub = await get(child, "application/xml,text/xml,*/*;q=0.5", 2_000_000);
          if (sub.status === 200) sitemapUrls.push(...parseSitemap(sub.body).urls);
        } catch {
          /* a failed child sitemap is not fatal */
        }
      }
    } catch {
      /* try the next candidate */
    }
  }
  done.push("robots");

  // --- choose pages -------------------------------------------------------
  const homePage = extractPage(home.finalUrl, home.body, { status: home.status, elapsedMs: home.elapsedMs, bytes: home.bytes });
  const pages: PageData[] = [homePage];
  pagesFetched = 1;

  const seen = new Set<string>([canonicalKey(new URL(home.finalUrl))]);
  const candidates: { url: string; score: number }[] = [];
  const skippedByRobots: string[] = [];
  const consider = (href: string, text: string, bonus: number) => {
    let u: URL;
    try {
      u = new URL(href);
    } catch {
      return;
    }
    if (!sameSite(u.toString(), origin) || SKIP_EXT.test(u.pathname) || SKIP_PATH.test(u.pathname)) return;
    u.hash = "";
    const key = canonicalKey(u);
    if (seen.has(key)) return;
    seen.add(key);
    if (!isAllowed(robotsFile, ROBOTS_TOKEN, u.pathname + u.search)) {
      if (skippedByRobots.length < 20) skippedByRobots.push(u.toString());
      return;
    }
    candidates.push({ url: u.toString(), score: scoreCandidate(u, text) + bonus });
  };
  // Links from the homepage reflect what the business itself considers important.
  for (const link of homePage.internalLinks) consider(link.href, link.text, 3);
  for (const u of sitemapUrls.slice(0, 500)) consider(u, "", 0);

  const chosen = pickDiverse(
    candidates.sort((a, b) => b.score - a.score),
    limits.maxPages - 1,
  );
  pagesPlanned = 1 + chosen.length;
  await report("crawl");

  // --- fetch pages --------------------------------------------------------
  const broken: { url: string; status: number | null }[] = [];
  await mapLimit(chosen, limits.concurrency, async (candidate) => {
    if (timeLeft() < 1500) return;
    try {
      const res = await get(candidate.url);
      if (res.status >= 400) {
        broken.push({ url: candidate.url, status: res.status });
      } else if (res.contentType.includes("html") && sameSite(res.finalUrl, origin)) {
        const key = canonicalKey(new URL(res.finalUrl));
        const alreadyHave = pages.some((p) => canonicalKey(new URL(p.url)) === key);
        if (!alreadyHave) {
          pages.push(extractPage(res.finalUrl, res.body, { status: res.status, elapsedMs: res.elapsedMs, bytes: res.bytes }));
        }
      }
    } catch {
      broken.push({ url: candidate.url, status: null });
    }
    pagesFetched++;
    await report("crawl");
  });
  done.push("crawl");

  return {
    inputUrl: startUrl,
    finalUrl: home.finalUrl,
    origin,
    robots: {
      status: robots.status,
      httpStatus: robots.http,
      sitemapsDeclared: robotsFile.sitemaps.slice(0, 5),
      blocksAllCrawlers: !isAllowed(robotsFile, "SomeGenericBot", "/"),
      aiCrawlers: aiCrawlerAccess(robotsFile),
    },
    sitemap: { found: Boolean(sitemapFound), url: sitemapFound, urlCount: sitemapUrls.length },
    pages,
    skippedByRobots,
    brokenInternalLinks: broken,
    fetchLog,
    homepageRedirects: home.redirects,
  };
}
