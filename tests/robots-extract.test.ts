import { describe, expect, it } from "vitest";
import { extractPage } from "@/lib/audit/extract";
import { aiCrawlerAccess, isAllowed, parseRobots, parseSitemap } from "@/lib/audit/robots";
import { goodSite, GOOD_ORIGIN } from "./fixtures";

describe("robots.txt", () => {
  const robots = parseRobots(`
# comment
User-agent: *
Disallow: /private/
Allow: /private/public-page
Disallow: /*.pdf$

User-agent: GPTBot
User-agent: PerplexityBot
Disallow: /

User-agent: RAimondAIBot
Disallow: /no-audit/

Sitemap: https://example.com/sitemap.xml
`);

  it("applies longest-match rules with Allow winning ties", () => {
    expect(isAllowed(robots, "SomeBot", "/")).toBe(true);
    expect(isAllowed(robots, "SomeBot", "/private/secret")).toBe(false);
    expect(isAllowed(robots, "SomeBot", "/private/public-page")).toBe(true);
    expect(isAllowed(robots, "SomeBot", "/files/brochure.pdf")).toBe(false);
    expect(isAllowed(robots, "SomeBot", "/files/brochure.pdf.html")).toBe(true);
  });

  it("uses the most specific group for a named crawler", () => {
    expect(isAllowed(robots, "RAimondAIBot", "/no-audit/x")).toBe(false);
    expect(isAllowed(robots, "RAimondAIBot", "/private/secret")).toBe(true);
  });

  it("reports which AI crawlers are blocked", () => {
    const access = Object.fromEntries(aiCrawlerAccess(robots).map((c) => [c.agent, c.allowed]));
    expect(access.GPTBot).toBe(false);
    expect(access.PerplexityBot).toBe(false);
    expect(access["OAI-SearchBot"]).toBe(true);
    expect(access.Googlebot).toBe(true);
  });

  it("treats an empty file as allow-all and collects sitemaps", () => {
    expect(isAllowed(parseRobots(""), "AnyBot", "/x")).toBe(true);
    expect(isAllowed(parseRobots("User-agent: *\nDisallow:"), "AnyBot", "/x")).toBe(true);
    expect(robots.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
  });

  it("parses sitemaps and sitemap indexes", () => {
    expect(parseSitemap(`<urlset><url><loc>https://a.com/x?a=1&amp;b=2</loc></url><url><loc><![CDATA[https://a.com/y]]></loc></url></urlset>`)).toEqual({
      isIndex: false,
      urls: ["https://a.com/x?a=1&b=2", "https://a.com/y"],
    });
    expect(parseSitemap(`<sitemapindex><sitemap><loc>https://a.com/s1.xml</loc></sitemap></sitemapindex>`).isIndex).toBe(true);
  });
});

describe("page extraction", () => {
  const site = goodSite();
  const home = extractPage(`${GOOD_ORIGIN}/`, site[`${GOOD_ORIGIN}/`].body!, { status: 200, elapsedMs: 100, bytes: 1 });

  it("reads titles, headings and metadata", () => {
    expect(home.title).toBe("Plumber in Tampa, FL | Acme Plumbing");
    expect(home.h1).toEqual(["Tampa Plumber You Can Trust"]);
    expect(home.h2.length).toBe(3);
    expect(home.hasViewport).toBe(true);
    expect(home.lang).toBe("en");
    expect(home.noindex).toBe(false);
    expect(home.wordCount).toBeGreaterThan(300);
  });

  it("parses business structured data", () => {
    const plumber = home.schema.find((s) => s.types.includes("Plumber"));
    expect(plumber).toMatchObject({ name: "Acme Plumbing", locality: "Tampa", region: "FL", hasOpeningHours: true, hasAggregateRating: true });
    expect(plumber?.areaServed).toContain("St. Petersburg");
    expect(home.schemaParseErrors).toBe(0);
  });

  it("finds contact details, links and trust signals", () => {
    expect(home.phones).toContain("8135550142");
    expect(home.hasTelLink).toBe(true);
    expect(home.hasPrivacyLink).toBe(true);
    expect(home.socialLinks.length).toBe(2);
    expect(home.internalLinks.map((l) => l.href)).toContain(`${GOOD_ORIGIN}/services/drain-cleaning`);
    expect(home.cityMentions[0]).toBe("Tampa, FL");
    expect(home.trustSignals.licensing).toEqual(expect.arrayContaining(["licensed", "insured"]));
    expect(home.trustSignals.reviews).toBe(true);
  });

  it("counts invalid JSON-LD instead of crashing, and detects noindex", () => {
    const p = extractPage("https://x.com/", `<html><head><meta name="robots" content="NOINDEX, follow"><script type="application/ld+json">{ not json </script></head><body><h1>A</h1><h1>B</h1></body></html>`, { status: 200, elapsedMs: 1, bytes: 1 });
    expect(p.schemaParseErrors).toBe(1);
    expect(p.schema).toEqual([]);
    expect(p.noindex).toBe(true);
    expect(p.h1.length).toBe(2);
  });

  it("does not count script or style text as content", () => {
    const p = extractPage("https://x.com/", `<html><body><script>var words = "one two three four five";</script><style>.a{color:red}</style><p>Hello world</p></body></html>`, { status: 200, elapsedMs: 1, bytes: 1 });
    expect(p.wordCount).toBe(2);
  });
});
