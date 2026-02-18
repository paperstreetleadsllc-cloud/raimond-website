import { describe, expect, it } from "vitest";
import { extractFaqs, extractServicesAndEntities, normalizeText } from "../extract.js";

describe("extract pipeline", () => {
  it("normalizes text and extracts FAQs from question headings", () => {
    const normalized = normalizeText("  Hello   world \n\nfrom\tAEO  ");
    expect(normalized).toBe("Hello world from AEO");

    const faqs = extractFaqs(
      ["What is term life insurance?", "Coverage options"],
      [
        "Term life insurance covers a fixed period.",
        "Options include term and whole life.",
      ],
    );

    expect(faqs).toEqual([
      {
        question: "What is term life insurance?",
        answer: "Term life insurance covers a fixed period.",
      },
    ]);
  });

  it("extracts service keywords and capitalized entities", () => {
    const result = extractServicesAndEntities(
      "Acme Insurance offers policy consulting and claims support in New York City.",
    );
    expect(result.services).toContain("insurance");
    expect(result.services).toContain("policy");
    expect(result.entities).toContain("Acme Insurance");
    expect(result.entities.some((entity) => entity.includes("New York City"))).toBe(true);
  });
});
