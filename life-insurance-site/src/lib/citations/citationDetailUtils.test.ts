import { describe, expect, it } from "vitest";
import { formatRank, parseCitationMatches } from "./citationDetailUtils";

describe("formatRank", () => {
  it("formats finite numbers as hash-rank", () => {
    expect(formatRank(1)).toBe("#1");
    expect(formatRank(10)).toBe("#10");
  });

  it("returns n/a for undefined, NaN, and Infinity", () => {
    expect(formatRank(undefined)).toBe("n/a");
    expect(formatRank(Number.NaN)).toBe("n/a");
    expect(formatRank(Number.POSITIVE_INFINITY)).toBe("n/a");
    expect(formatRank(Number.NEGATIVE_INFINITY)).toBe("n/a");
  });
});

describe("parseCitationMatches", () => {
  it("returns empty array for non-array input", () => {
    expect(parseCitationMatches(null)).toEqual([]);
    expect(parseCitationMatches({})).toEqual([]);
    expect(parseCitationMatches("not-an-array")).toEqual([]);
  });

  it("rejects non-object entries and entries without a valid url", () => {
    const parsed = parseCitationMatches([
      42,
      "x",
      null,
      undefined,
      { rank: 1 },
      { url: "   " },
      { url: 123 },
    ]);
    expect(parsed).toEqual([]);
  });

  it("trims url and matchedDomain, includes only finite rank", () => {
    const parsed = parseCitationMatches([
      { url: " https://a.example/page ", matchedDomain: " a.example ", rank: 3 },
      { url: "https://b.example", matchedDomain: "   ", rank: Number.NaN },
      { url: "https://c.example", rank: Number.POSITIVE_INFINITY },
    ]);

    expect(parsed).toEqual([
      { url: "https://a.example/page", matchedDomain: "a.example", rank: 3 },
      { url: "https://b.example" },
      { url: "https://c.example" },
    ]);
  });

  it("preserves stable order", () => {
    const parsed = parseCitationMatches([
      { url: "https://first.example", rank: 1 },
      { url: "https://second.example", rank: 2 },
      { url: "https://third.example", rank: 3 },
    ]);

    expect(parsed.map((item) => item.url)).toEqual([
      "https://first.example",
      "https://second.example",
      "https://third.example",
    ]);
  });
});
