import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { chunkByParagraphs } from "../chunk.js";
import { crawlSite } from "../crawl.js";
import { createSiteProfile, generateQueryUniverse } from "../query-universe.js";
import { simulateAeoVisibility } from "../simulate.js";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const fixture = (name: string): Promise<string> =>
  readFile(path.join(testDir, "fixtures", name), "utf8");

describe("simulateAeoVisibility deterministic snapshot", () => {
  it("returns stable scoring output for known fixture site", async () => {
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

    const crawled = await crawlSite({
      startUrl: "https://example.com",
      maxDepth: 2,
      maxPages: 50,
      concurrency: 3,
      fetchHtml: async (url) => pageMap[url] ?? "",
    });

    const createdAt = "2026-02-17T00:00:00.000Z";
    const chunks = crawled.pages.flatMap((page, pageIndex) =>
      chunkByParagraphs({
        documentId: `doc_${pageIndex}`,
        siteId: "site_fixture",
        sourceUrl: page.url,
        heading: page.h1[0] ?? page.h2[0],
        text: page.mainText,
        createdAt,
      }),
    );

    const profile = createSiteProfile({
      businessName: "Acme Insurance",
      vertical: "insurance",
      services: crawled.pages.flatMap((page) => page.services),
      entities: crawled.pages.flatMap((page) => page.entities),
      faqQuestions: crawled.pages.flatMap((page) => page.faqs.map((faq) => faq.question)),
      headings: crawled.pages.flatMap((page) => [...page.h1, ...page.h2]),
      pageCount: crawled.pages.length,
      chunkCount: chunks.length,
    });

    const queries = generateQueryUniverse(profile);
    const simulation = simulateAeoVisibility({
      queries,
      chunks: chunks.map((chunk) => ({
        id: chunk.id,
        sourceUrl: chunk.sourceUrl,
        heading: chunk.heading,
        content: chunk.content,
        createdAt: chunk.createdAt,
      })),
      nowIso: createdAt,
    });

    expect({
      totalScore: simulation.totalScore,
      queryCount: queries.length,
      topWinningQueries: simulation.topWinningQueries.slice(0, 5),
      weakAreas: simulation.weakAreas,
      findings: simulation.findings,
    }).toMatchInlineSnapshot(`
      {
        "findings": [
          "Average query visibility score is 35/100.",
          "Top-performing queries: acme insurance life insurance for modern families you; acme insurance life insurance for modern families term; best life insurance for modern families in acme insurance.",
          "Weakest categories: comparison, pricing, informational.",
        ],
        "queryCount": 230,
        "topWinningQueries": [
          "acme insurance life insurance for modern families you",
          "acme insurance life insurance for modern families term",
          "best life insurance for modern families in acme insurance",
          "best practices for life insurance for modern families",
          "best life insurance for modern families in you",
        ],
        "totalScore": 35,
        "weakAreas": [
          "comparison",
          "pricing",
          "informational",
        ],
      }
    `);
  });
});
