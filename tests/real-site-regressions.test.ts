import { describe, expect, it } from "vitest";
import { pickDiverse } from "@/lib/audit/crawl";
import { coreBusinessName } from "@/lib/audit/score";

/** Regressions found by auditing real business sites on the preview deployment. */
describe("crawl page selection", () => {
  const c = (path: string, score: number) => ({ url: `https://example.com${path}`, score });

  it("stops one section from taking every slot", () => {
    const areas = Array.from({ length: 12 }, (_, i) => c(`/service-area/city-${i}/`, 9));
    const others = [c("/services/", 8), c("/about/", 7), c("/contact/", 7), c("/services/drain-cleaning/", 6)];
    const sorted = [...areas, ...others].sort((a, b) => b.score - a.score);
    const picked = pickDiverse(sorted, 9).map((p) => new URL(p.url).pathname);
    expect(picked).toContain("/services/");
    expect(picked).toContain("/about/");
    expect(picked).toContain("/contact/");
    expect(picked).toContain("/services/drain-cleaning/");
    expect(picked).toHaveLength(9);
  });

  it("fills leftover slots when the site has only one section", () => {
    const areas = Array.from({ length: 12 }, (_, i) => c(`/service-area/city-${i}/`, 9));
    expect(pickDiverse(areas, 9)).toHaveLength(9);
  });

  it("treats top-level pages as separate sections", () => {
    const pages = ["/about", "/contact", "/services", "/faq", "/reviews"].map((p) => c(p, 5));
    expect(pickDiverse(pages, 9)).toHaveLength(5);
  });
});

describe("coreBusinessName", () => {
  it("drops trade words and legal suffixes", () => {
    expect(coreBusinessName("Flow Pros Plumbing")).toBe("flow pros");
    expect(coreBusinessName("Heaven Sent Roofing LLC")).toBe("heaven sent");
  });
  it("returns nothing when no distinctive part remains", () => {
    expect(coreBusinessName("The Plumbing Company")).toBe("");
    expect(coreBusinessName("")).toBe("");
  });
});
