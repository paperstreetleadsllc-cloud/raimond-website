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

import { extractPage } from "@/lib/audit/extract";

describe("online booking links", () => {
  const meta = { status: 200, elapsedMs: 10, bytes: 100 };
  it("recognises a hosted booking tool as a way to make contact", () => {
    const html = `<html><body><a href="https://book.housecallpro.com/book/Acme/abc">Request Service</a></body></html>`;
    expect(extractPage("https://acme.example/", html, meta).bookingProvider).toBe("Housecall Pro");
  });
  it("does not match look-alike hosts", () => {
    const html = `<html><body><a href="https://nothousecallpro.com/x">x</a><a href="https://example.org/calendly.com">y</a></body></html>`;
    expect(extractPage("https://acme.example/", html, meta).bookingProvider).toBeNull();
  });
});

import { servesNationwide } from "@/lib/audit/business";
import { generatePrompts } from "@/lib/audit/prompts";
import type { BusinessProfile } from "@/lib/audit/types";

describe("country-wide businesses", () => {
  const profile = {
    name: { value: "Acme Auto Transport", source: "structured data on the site" },
    industry: { key: "auto_transport", label: "Vehicle shipping", source: "keywords" },
    locations: { value: ["Madeira Beach, FL", "United States"], source: "structured data" },
    services: [{ name: "enclosed transport", foundOn: ["/"] }],
  } as unknown as BusinessProfile;

  it("is detected from areaServed", () => {
    expect(servesNationwide(profile)).toBe(true);
    expect(servesNationwide({ ...profile, locations: { value: ["Tampa, FL"], source: "x" } } as BusinessProfile)).toBe(false);
  });

  it("does not generate questions about the office town", () => {
    const questions = generatePrompts(profile).map((p) => p.question);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.join(" ")).not.toContain("Madeira Beach");
  });
});

describe("question headings", () => {
  it("ignores calls to action that end in a question mark", () => {
    const html = `<html><body><h2>Need a Vehicle Moved?</h2><h2>How much does car shipping cost?</h2></body></html>`;
    const page = extractPage("https://acme.example/", html, { status: 200, elapsedMs: 1, bytes: 1 });
    expect(page.questionHeadings).toEqual(["How much does car shipping cost?"]);
  });
});

import { GUIDES } from "@/lib/guides";

describe("guides practise what the audit recommends", () => {
  it("every section is a real question with a direct answer", () => {
    for (const g of GUIDES) {
      expect(g.description.length).toBeGreaterThanOrEqual(50);
      expect(g.description.length).toBeLessThanOrEqual(170);
      expect(g.sections.length).toBeGreaterThanOrEqual(5);
      for (const s of g.sections) {
        expect(s.question.endsWith("?")).toBe(true);
        expect(s.answer[0].length).toBeGreaterThan(40);
      }
    }
  });
  it("makes no guarantees", () => {
    const text = JSON.stringify(GUIDES).toLowerCase();
    expect(text).not.toMatch(/we guarantee|guaranteed (ranking|leads|results)/);
  });
});
