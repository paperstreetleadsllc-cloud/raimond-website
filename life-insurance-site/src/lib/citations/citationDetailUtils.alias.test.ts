import { describe, expect, it } from "vitest";
import { formatRank } from "@/src/lib/citations/citationDetailUtils";

describe("citationDetailUtils alias import", () => {
  it("resolves @/src alias and returns formatted rank", () => {
    expect(formatRank(7)).toBe("#7");
  });
});
