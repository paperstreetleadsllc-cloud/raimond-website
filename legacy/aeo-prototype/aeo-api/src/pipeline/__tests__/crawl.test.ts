import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { crawlSite, parseHtmlPage } from "../crawl.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): Promise<string> =>
  readFile(path.join(testDir, "fixtures", name), "utf8");

describe("crawl pipeline HTML parsing", () => {
  it("extracts title, metadata, headings, text, and internal links", async () => {
    const html = await fixture("home.html");
    const parsed = parseHtmlPage("https://example.com", html);

    expect(parsed.title).toBe("Acme Insurance - Home");
    expect(parsed.metaDescription).toContain("life and disability coverage");
    expect(parsed.h1[0]).toContain("Life Insurance");
    expect(parsed.h2.length).toBeGreaterThanOrEqual(2);
    expect(parsed.mainText).toContain("Term life insurance provides protection");
    expect(parsed.faqs.length).toBeGreaterThanOrEqual(1);
    expect(parsed.services).toContain("insurance");
    expect(parsed.internalLinks).toContain("https://example.com/products");
    expect(parsed.internalLinks).toContain("https://example.com/about");
    expect(parsed.internalLinks.some((url) => url.includes("external.example"))).toBe(false);
  });

  it("crawls internal pages up to depth and skips noindex pages for indexing", async () => {
    const [home, products, faqNoIndex] = await Promise.all([
      fixture("home.html"),
      fixture("products.html"),
      fixture("faq-noindex.html"),
    ]);

    const pageMap: Record<string, string> = {
      "https://example.com": home,
      "https://example.com/products": products,
      "https://example.com/faq": faqNoIndex,
      "https://example.com/about": "<html><body><main><h1>About</h1><p>About page.</p></main></body></html>",
    };

    const result = await crawlSite({
      startUrl: "https://example.com",
      maxDepth: 2,
      maxPages: 50,
      concurrency: 3,
      fetchHtml: async (url) => pageMap[url] ?? "",
    });

    expect(result.pagesDiscovered).toBeGreaterThanOrEqual(4);
    expect(result.pagesIndexed).toBe(3);
    expect(result.skippedNoindex).toBe(1);
    expect(result.pages.some((page) => page.url === "https://example.com/faq")).toBe(false);
  });
});
