import { describe, expect, it } from "vitest";
import { chunkByParagraphs } from "../chunk.js";

describe("chunk pipeline", () => {
  it("chunks paragraph text with URL and heading metadata", () => {
    const text = [
      "First paragraph with product details.",
      "Second paragraph with coverage examples.",
      "Third paragraph with FAQ context.",
    ].join("\n\n");

    const chunks = chunkByParagraphs(
      {
        documentId: "doc_test",
        siteId: "site_test",
        sourceUrl: "https://example.com/products",
        heading: "Insurance Products",
        text,
        createdAt: "2026-02-17T00:00:00.000Z",
      },
      70,
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.sourceUrl).toBe("https://example.com/products");
    expect(chunks[0]?.heading).toBe("Insurance Products");
    expect(chunks.every((chunk) => chunk.content.length <= 70)).toBe(true);
  });
});
