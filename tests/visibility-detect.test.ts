import { describe, expect, it } from "vitest";
import { analyzeObservation, hostOf, normalizeBusinessName, summarize } from "@/lib/visibility/detect";
import type { RawObservation } from "@/lib/visibility/types";

const business = { name: "Acme Plumbing, LLC", siteUrl: "https://www.acmeplumbing-tampa.com/" };

const listAnswer = `Here are well-reviewed plumbers in Tampa:

1. **Acme Plumbing** - family owned, offers same-day service [1]
2. **Rival Rooter Co.** - known for drain cleaning [2]
3. **Bay Area Pipe Pros**: 24/7 emergency calls [3]

Always confirm licensing before hiring.`;

describe("observation analysis", () => {
  it("normalizes names and hosts", () => {
    expect(normalizeBusinessName("Acme Plumbing, LLC")).toBe("acme plumbing");
    expect(normalizeBusinessName("Smith & Sons Roofing Co. Inc.")).toBe("smith and sons roofing");
    expect(hostOf("https://www.Example.com/path")).toBe("example.com");
    expect(hostOf("not a url %%")).toBeNull();
  });

  it("detects mention, recommendation, citation and competitors in a list answer", () => {
    const a = analyzeObservation(
      { intent: "local", answerText: listAnswer, citations: ["https://acmeplumbing-tampa.com/services/drain-cleaning", "https://rivalrooter.com/", "https://www.yelp.com/biz/bay-area-pipe-pros"] },
      business,
    );
    expect(a).toMatchObject({ mentioned: true, recommended: true, cited: true });
    expect(a.citedUrls).toEqual(["https://acmeplumbing-tampa.com/services/drain-cleaning"]);
    expect(a.namedCompetitors).toEqual(["Rival Rooter Co", "Bay Area Pipe Pros"]);
    expect(a.citedCompetitorDomains).toEqual(["rivalrooter.com"]); // Yelp is a directory, not a competitor
  });

  it("does not count a passing mention as a recommendation", () => {
    const a = analyzeObservation(
      { intent: "local", answerText: "Some residents mention Acme Plumbing, but the top options are:\n- **Rival Rooter Co.**\n- **Bay Area Pipe Pros**", citations: [] },
      business,
    );
    expect(a).toMatchObject({ mentioned: true, recommended: false, cited: false });
  });

  it("never reports a recommendation for an informational question", () => {
    const a = analyzeObservation({ intent: "informational", answerText: "- **Acme Plumbing** explains how to choose a plumber.", citations: [] }, business);
    expect(a.mentioned).toBe(true);
    expect(a.recommended).toBe(false);
    expect(a.namedCompetitors).toEqual([]);
  });

  it("reports absence plainly", () => {
    const a = analyzeObservation({ intent: "local", answerText: "1. **Rival Rooter Co.**\n2. **Bay Area Pipe Pros**", citations: ["https://rivalrooter.com"] }, business);
    expect(a).toMatchObject({ mentioned: false, recommended: false, cited: false });
  });

  it("does not match a name inside a longer unrelated word, and handles a missing name", () => {
    expect(analyzeObservation({ intent: "local", answerText: "Try Acmeplumbingsupply warehouse.", citations: [] }, business).mentioned).toBe(false);
    const noName = analyzeObservation({ intent: "local", answerText: "See acmeplumbing-tampa.com for details.", citations: [] }, { name: null, siteUrl: business.siteUrl });
    expect(noName.mentioned).toBe(true);
    expect(noName.recommended).toBe(false);
  });

  it("counts a citation on a subdomain but not on a look-alike domain", () => {
    const sub = analyzeObservation({ intent: "local", answerText: "", citations: ["https://blog.acmeplumbing-tampa.com/x"] }, business);
    const fake = analyzeObservation({ intent: "local", answerText: "", citations: ["https://notacmeplumbing-tampa.com/x", "https://acmeplumbing-tampa.com.evil.io/"] }, business);
    expect(sub.cited).toBe(true);
    expect(fake.cited).toBe(false);
  });
});

describe("visibility summary", () => {
  const base: Omit<RawObservation, "question" | "observedAt"> = { provider: "p1", method: "m", model: "x", intent: "local", answerText: listAnswer, citations: [], costUsd: 0.01 };
  it("reports rates with sample size and observation period", () => {
    const rows = [
      { ...base, question: "q1", observedAt: "2026-11-02T00:00:00Z" },
      { ...base, question: "q2", observedAt: "2026-11-01T00:00:00Z", answerText: "1. **Rival Rooter Co.**" },
    ].map((o) => ({ ...o, analysis: analyzeObservation(o, business) }));
    expect(summarize(rows)).toEqual([
      { provider: "p1", promptsTested: 2, mentionRate: 0.5, recommendationRate: 0.5, citationRate: 0, firstObservedAt: "2026-11-01T00:00:00Z", lastObservedAt: "2026-11-02T00:00:00Z" },
    ]);
  });
  it("returns nothing, not zeros, when there are no observations", () => {
    expect(summarize([])).toEqual([]);
  });
});
