import { load } from "cheerio";
import pLimit from "p-limit";
import { fetch } from "undici";
import { extractSignals, normalizeText, type ExtractedFaq } from "./extract.js";

export type CrawledPage = {
  url: string;
  title?: string;
  metaDescription?: string;
  h1: string[];
  h2: string[];
  mainText: string;
  paragraphs: string[];
  faqs: ExtractedFaq[];
  services: string[];
  entities: string[];
  noindex: boolean;
  internalLinks: string[];
};

export type CrawlSiteOptions = {
  startUrl: string;
  maxDepth?: number;
  maxPages?: number;
  concurrency?: number;
  fetchHtml?: (url: string) => Promise<string>;
};

export type CrawlSiteResult = {
  pagesDiscovered: number;
  pagesIndexed: number;
  pages: CrawledPage[];
  skippedNoindex: number;
};

const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_MAX_PAGES = 50;
const DEFAULT_CONCURRENCY = 4;
const REQUEST_TIMEOUT_MS = 15_000;

const normalizeUrl = (rawUrl: string): string => {
  const url = new URL(rawUrl);
  url.hash = "";
  if (url.pathname.endsWith("/") && url.pathname.length > 1) {
    url.pathname = url.pathname.slice(0, -1);
  }
  const pathname = url.pathname === "/" ? "" : url.pathname;
  return `${url.protocol}//${url.host}${pathname}${url.search}`;
};

const isInternalLink = (baseUrl: URL, candidate: URL): boolean =>
  candidate.protocol.startsWith("http") && candidate.host === baseUrl.host;

const isNoIndex = (robotsContent?: string): boolean =>
  (robotsContent ?? "")
    .toLowerCase()
    .split(",")
    .map((token) => token.trim())
    .includes("noindex");

const defaultFetchHtml = async (targetUrl: string): Promise<string> => {
  const response = await fetch(targetUrl, {
    headers: {
      "user-agent": "aeo-visibility-os/0.1 (+local-dev)",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const contentType = response.headers.get("content-type");
  if (contentType && !contentType.includes("text/html")) {
    return "";
  }

  return response.text();
};

export const parseHtmlPage = (pageUrl: string, html: string): CrawledPage => {
  const $ = load(html);

  $("script, style, noscript, svg").remove();

  const title = normalizeText($("title").first().text());
  const metaDescription = normalizeText(
    $('meta[name="description"]').first().attr("content") ?? "",
  );
  const robotsMeta = $('meta[name="robots"]').first().attr("content");

  const h1 = $("h1")
    .map((_, node) => normalizeText($(node).text()))
    .get()
    .filter(Boolean);
  const h2 = $("h2")
    .map((_, node) => normalizeText($(node).text()))
    .get()
    .filter(Boolean);

  const container = $("main").first().length > 0 ? $("main").first() : $("body").first();
  const paragraphs = container
    .find("p, li")
    .map((_, node) => normalizeText($(node).text()))
    .get()
    .filter((text) => text.length > 0);

  const mainText = normalizeText(paragraphs.join("\n\n"));
  const signals = extractSignals({
    mainText,
    headings: [...h1, ...h2],
    paragraphs,
  });

  const base = new URL(pageUrl);
  const internalLinks = Array.from(
    new Set(
      $("a[href]")
        .map((_, node) => {
          const href = ($(node).attr("href") ?? "").trim();
          if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) {
            return null;
          }
          try {
            const resolved = new URL(href, base);
            if (!isInternalLink(base, resolved)) {
              return null;
            }
            return normalizeUrl(resolved.toString());
          } catch {
            return null;
          }
        })
        .get()
        .filter((value): value is string => value !== null),
    ),
  );

  return {
    url: normalizeUrl(pageUrl),
    title: title || undefined,
    metaDescription: metaDescription || undefined,
    h1,
    h2,
    mainText: signals.normalizedText,
    paragraphs,
    faqs: signals.faqs,
    services: signals.services,
    entities: signals.entities,
    noindex: isNoIndex(robotsMeta),
    internalLinks,
  };
};

export const crawlSite = async (options: CrawlSiteOptions): Promise<CrawlSiteResult> => {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const concurrency = Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY);
  const fetchHtml = options.fetchHtml ?? defaultFetchHtml;

  const start = normalizeUrl(options.startUrl);
  const seen = new Set<string>([start]);
  let frontier = [start];
  const pages: CrawledPage[] = [];
  let skippedNoindex = 0;
  const limit = pLimit(concurrency);

  for (let depth = 0; depth <= maxDepth && frontier.length > 0; depth += 1) {
    const remainingSlots = maxPages - seen.size + frontier.length;
    if (remainingSlots <= 0) {
      break;
    }

    const urlsAtDepth = frontier.slice(0, maxPages);
    frontier = [];

    const parsedAtDepth = await Promise.all(
      urlsAtDepth.map((url) =>
        limit(async () => {
          try {
            const html = await fetchHtml(url);
            if (!html) {
              return null;
            }
            return parseHtmlPage(url, html);
          } catch {
            return null;
          }
        }),
      ),
    );

    for (const page of parsedAtDepth) {
      if (!page) {
        continue;
      }

      if (page.noindex) {
        skippedNoindex += 1;
      } else {
        pages.push(page);
      }

      if (depth >= maxDepth) {
        continue;
      }

      for (const link of page.internalLinks) {
        if (seen.has(link) || seen.size >= maxPages) {
          continue;
        }
        seen.add(link);
        frontier.push(link);
      }
    }
  }

  return {
    pagesDiscovered: seen.size,
    pagesIndexed: pages.length,
    pages,
    skippedNoindex,
  };
};
