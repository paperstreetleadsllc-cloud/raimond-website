import { describe, expect, it } from "vitest";
import { FREE_AUDIT_LIMITS } from "@/lib/audit/crawl";
import { runAudit } from "@/lib/audit/pipeline";
import { DEFAULT_SCORING, type ScoringConfig } from "@/lib/audit/score";
import { AuditError, type AuditProgress } from "@/lib/audit/types";
import { fakeSite, goodSite, weakSite, GOOD_ORIGIN, WEAK_ORIGIN } from "./fixtures";

const fast = { ...FREE_AUDIT_LIMITS };

describe("audit pipeline on a well-built site", () => {
  it("identifies the business from the site's own content", async () => {
    const result = await runAudit("acmeplumbing-tampa.com", { fetcher: fakeSite(goodSite()), limits: fast });
    expect(result.business.name?.value).toBe("Acme Plumbing");
    expect(result.business.industry?.key).toBe("plumbing");
    expect(result.business.locations?.value[0]).toBe("Tampa, FL");
    expect(result.business.services.map((s) => s.name)).toEqual(expect.arrayContaining(["drain cleaning", "water heater repair", "leak detection"]));
    expect(result.business.phone).toBe("8135550142");
  });

  it("scores with evidence on every check and categories that total 100", async () => {
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(goodSite()), limits: fast });
    const { readiness } = result;
    expect(readiness.categories.reduce((s, c) => s + c.max, 0)).toBe(100);
    expect(readiness.score).toBeGreaterThanOrEqual(80);
    expect(readiness.score).toBeLessThanOrEqual(100);
    for (const check of readiness.checks) {
      expect(check.evidence.length, check.id).toBeGreaterThan(0);
      expect(check.earned, check.id).toBeLessThanOrEqual(check.max + 0.05);
    }
    const sum = readiness.checks.reduce((s, c) => s + c.earned, 0);
    expect(Math.abs(sum - readiness.categories.reduce((s, c) => s + c.earned, 0))).toBeLessThan(1);
    expect(result.stats.pagesAnalyzed).toBe(7);
    expect(result.stats.paidApiCostUsd).toBe(0);
  });

  it("only recommends fixes for checks that did not pass", async () => {
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(goodSite()), limits: fast });
    const passed = new Set(result.readiness.checks.filter((c) => c.status === "pass").map((c) => c.id));
    for (const rec of result.recommendations) {
      expect(passed.has(rec.checkId)).toBe(false);
      expect(rec.evidence.length).toBeGreaterThan(0);
      expect(rec.implementation.length).toBeGreaterThan(0);
      expect(rec.verification).toBeTruthy();
    }
  });

  it("generates questions from detected facts and reports no provider as measured", async () => {
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(goodSite()), limits: fast });
    expect(result.prompts.some((p) => p.question === "Who is the best plumber in Tampa, FL?")).toBe(true);
    expect(new Set(result.prompts.map((p) => p.intent)).size).toBeGreaterThanOrEqual(4);
    expect(result.providers.length).toBeGreaterThan(0);
    expect(result.providers.every((p) => p.status === "not_measured")).toBe(true);
    expect(JSON.stringify(result.providers)).not.toMatch(/\d+%/);
  });

  it("is deterministic and reports real progress events in order", async () => {
    const events: AuditProgress[] = [];
    const a = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(goodSite()), limits: fast, onProgress: (p) => void events.push(p) });
    const b = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(goodSite()), limits: fast });
    expect(a.readiness).toEqual(b.readiness);
    const stages = events.map((e) => e.stage).filter((s, i, arr) => arr[i - 1] !== s);
    expect(stages).toEqual(["validate", "robots", "crawl", "analyze", "score"]);
    const crawlEvents = events.filter((e) => e.stage === "crawl");
    expect(crawlEvents.at(-1)?.pagesFetched).toBe(crawlEvents.at(-1)?.pagesPlanned);
  });

  it("honors robots.txt for individual pages", async () => {
    const site = goodSite();
    site[`${GOOD_ORIGIN}/robots.txt`] = { contentType: "text/plain", body: "User-agent: *\nDisallow: /about\n" };
    const fetcher = fakeSite(site);
    const result = await runAudit(GOOD_ORIGIN, { fetcher, limits: fast });
    expect(fetcher.calls).not.toContain(`${GOOD_ORIGIN}/about`);
    expect(result.crawl.skippedByRobots).toContain(`${GOOD_ORIGIN}/about`);
  });

  it("flags blocked AI search crawlers", async () => {
    const site = goodSite();
    site[`${GOOD_ORIGIN}/robots.txt`] = { contentType: "text/plain", body: "User-agent: OAI-SearchBot\nDisallow: /\n\nUser-agent: PerplexityBot\nDisallow: /\n" };
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(site), limits: fast });
    const check = result.readiness.checks.find((c) => c.id === "ai_crawlers")!;
    expect(check.status).toBe("partial");
    expect(check.evidence[0]).toContain("OAI-SearchBot");
    expect(result.recommendations[0].checkId).toBe("ai_crawlers");
  });

  it("supports a custom scoring configuration", async () => {
    const custom: ScoringConfig = {
      ...DEFAULT_SCORING,
      categories: { ...DEFAULT_SCORING.categories, technical: { label: "Technical", max: 40 }, content: { label: "Content", max: 5 } },
    };
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(goodSite()), limits: fast, scoring: custom });
    expect(result.readiness.categories.find((c) => c.key === "technical")?.max).toBe(40);
    expect(result.readiness.categories.reduce((s, c) => s + c.max, 0)).toBe(100);
  });
});

describe("audit pipeline on difficult sites", () => {
  it("handles a site with no robots.txt, sitemap, or schema without inventing facts", async () => {
    const result = await runAudit(WEAK_ORIGIN, { fetcher: fakeSite(weakSite()), limits: fast });
    expect(result.crawl.robots.status).toBe("missing");
    expect(result.crawl.sitemap.found).toBe(false);
    expect(result.business.industry).toBeNull();
    expect(result.business.locations).toBeNull();
    expect(result.business.name).toBeNull();
    expect(result.prompts).toEqual([]);
    expect(result.readiness.score).toBeLessThan(30);
    const ids = result.recommendations.map((r) => r.checkId);
    expect(ids).toEqual(expect.arrayContaining(["server_rendered", "schema_business", "sitemap"]));
    expect(result.readiness.checks.find((c) => c.id === "server_rendered")?.status).toBe("fail");
  });

  it("follows redirects to the canonical host and re-reads robots.txt there", async () => {
    const site = goodSite();
    const www: typeof site = {};
    for (const [url, res] of Object.entries(site)) www[url.replace("https://acme", "https://www.acme")] = res;
    www[`${GOOD_ORIGIN}/`] = { redirectTo: "https://www.acmeplumbing-tampa.com/" };
    www[`${GOOD_ORIGIN}/robots.txt`] = { status: 404 };
    const fetcher = fakeSite(www);
    const result = await runAudit(GOOD_ORIGIN, { fetcher, limits: fast });
    expect(result.finalUrl).toBe("https://www.acmeplumbing-tampa.com/");
    expect(result.crawl.homepageRedirects).toEqual(["https://www.acmeplumbing-tampa.com/"]);
    expect(fetcher.calls).toContain("https://www.acmeplumbing-tampa.com/robots.txt");
    expect(result.crawl.robots.status).toBe("found");
  });

  it("fails clearly when the site is unreachable", async () => {
    const fetcher = fakeSite({
      "https://down-example.com/robots.txt": { throws: new AuditError("UNREACHABLE", "We couldn't connect to that website.") },
      "http://down-example.com/robots.txt": { throws: new AuditError("UNREACHABLE", "We couldn't connect to that website.") },
      "https://down-example.com/": { throws: new AuditError("UNREACHABLE", "We couldn't connect to that website.") },
      "http://down-example.com/": { throws: new AuditError("UNREACHABLE", "We couldn't connect to that website.") },
    });
    await expect(runAudit("down-example.com", { fetcher, limits: fast })).rejects.toMatchObject({ code: "UNREACHABLE" });
  });

  it("falls back to http when a site has no HTTPS", async () => {
    const down = { throws: new AuditError("UNREACHABLE", "x") };
    const fetcher = fakeSite({
      "https://old-example.com/robots.txt": down,
      "https://old-example.com/": down,
      "http://old-example.com/robots.txt": { status: 404 },
      "http://old-example.com/": { body: "<html><head><title>Old Example Roofing</title></head><body><h1>Roofing</h1></body></html>" },
    });
    const result = await runAudit("old-example.com", { fetcher, limits: fast });
    expect(result.finalUrl).toBe("http://old-example.com/");
    expect(result.readiness.checks.find((c) => c.id === "https")?.status).toBe("fail");
  });

  it("fails when the homepage returns an error status", async () => {
    const fetcher = fakeSite({ "https://gone-example.com/robots.txt": { status: 404 }, "https://gone-example.com/": { status: 503, body: "<html>down</html>" } });
    await expect(runAudit("gone-example.com", { fetcher, limits: fast })).rejects.toMatchObject({ code: "UNREACHABLE" });
  });

  it("refuses to crawl when robots.txt disallows everything or errors", async () => {
    const blocked = fakeSite({ "https://private-example.com/robots.txt": { contentType: "text/plain", body: "User-agent: *\nDisallow: /" }, "https://private-example.com/": { body: "<html></html>" } });
    await expect(runAudit("private-example.com", { fetcher: blocked, limits: fast })).rejects.toMatchObject({ code: "ROBOTS_DISALLOWED" });
    expect(blocked.calls).toEqual(["https://private-example.com/robots.txt"]);

    const erroring = fakeSite({ "https://err-example.com/robots.txt": { status: 500 }, "https://err-example.com/": { body: "<html></html>" } });
    await expect(runAudit("err-example.com", { fetcher: erroring, limits: fast })).rejects.toMatchObject({ code: "ROBOTS_DISALLOWED" });
  });

  it("rejects non-HTML targets", async () => {
    const fetcher = fakeSite({ "https://file-example.com/robots.txt": { status: 404 }, "https://file-example.com/": { contentType: "application/pdf", body: "%PDF-1.7" } });
    await expect(runAudit("file-example.com", { fetcher, limits: fast })).rejects.toMatchObject({ code: "NOT_HTML" });
  });

  it("caps the crawl on large websites", async () => {
    const site = goodSite();
    const urls = Array.from({ length: 1500 }, (_, i) => `${GOOD_ORIGIN}/blog/post-${i}`);
    site[`${GOOD_ORIGIN}/sitemap.xml`] = { contentType: "application/xml", body: `<urlset>${urls.map((u) => `<url><loc>${u}</loc></url>`).join("")}</urlset>` };
    for (const u of urls.slice(0, 50)) site[u] = { body: "<html><head><title>Post</title></head><body><h1>Post</h1></body></html>" };
    const fetcher = fakeSite(site);
    const result = await runAudit(GOOD_ORIGIN, { fetcher, limits: fast });
    expect(result.stats.pagesAnalyzed).toBeLessThanOrEqual(fast.maxPages);
    expect(fetcher.calls.length).toBeLessThanOrEqual(fast.maxPages + 2);
    // Service pages linked from the homepage outrank bulk sitemap entries.
    expect(result.crawl.pages.some((p) => p.url.endsWith("/services/drain-cleaning"))).toBe(true);
  });

  it("stops within its time budget when pages are slow", async () => {
    const site = goodSite();
    for (const key of Object.keys(site)) if (key.includes("/services/") || key.endsWith("/about") || key.endsWith("/faq") || key.endsWith("/contact")) site[key] = { ...site[key], delayMs: 5000 };
    const started = Date.now();
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(site), limits: { ...fast, requestTimeoutMs: 300, totalBudgetMs: 3000 } });
    expect(Date.now() - started).toBeLessThan(4000);
    expect(result.stats.pagesAnalyzed).toBe(1);
    expect(result.crawl.brokenInternalLinks.length).toBeGreaterThan(0);
  });

  it("records broken internal links", async () => {
    const site = goodSite();
    delete site[`${GOOD_ORIGIN}/about`];
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(site), limits: fast });
    expect(result.crawl.brokenInternalLinks).toContainEqual({ url: `${GOOD_ORIGIN}/about`, status: 404 });
  });

  it("truncates oversized pages instead of loading them fully", async () => {
    const site = goodSite();
    site[`${GOOD_ORIGIN}/`] = { body: site[`${GOOD_ORIGIN}/`].body! + "x".repeat(3_000_000) };
    const result = await runAudit(GOOD_ORIGIN, { fetcher: fakeSite(site), limits: fast });
    expect(result.crawl.pages[0].bytes).toBeLessThanOrEqual(fast.maxBytesPerPage);
  });
});
