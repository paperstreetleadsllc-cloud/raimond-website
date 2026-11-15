import { normalizeText } from "./extract.js";
import type { GeneratedQuery } from "./query-universe.js";
import { rankChunks, type RankedChunk, type RetrievalChunk } from "./retrieval.js";

export type QuerySimulation = {
  query: string;
  category: string;
  score: number;
  citationLikelihood: number;
  topChunkIds: string[];
};

export type AuditSimulationOutput = {
  totalScore: number;
  topWinningQueries: string[];
  weakAreas: string[];
  competitorGap: string;
  recommendedActions: string[];
  findings: string[];
  queryResults: QuerySimulation[];
};

const tokenize = (value: string): string[] =>
  normalizeText(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const computeCitationLikelihood = (
  query: string,
  ranked: RankedChunk[],
  referenceTimestampMs: number,
): number => {
  if (ranked.length === 0) {
    return 0;
  }
  const queryTokens = tokenize(query);
  const top = ranked[0];
  const snippet = `${top?.chunk.heading ?? ""} ${top?.chunk.content ?? ""}`;
  const snippetTokens = tokenize(snippet);

  const entityMatch = clamp01(
    queryTokens.filter((token) => snippetTokens.includes(token)).length /
      Math.max(1, queryTokens.length),
  );

  const claimTerms = ["is", "offers", "includes", "covers", "licensed", "certified", "review"];
  const claimDensity = clamp01(
    claimTerms.filter((term) => snippet.toLowerCase().includes(term)).length / claimTerms.length,
  );

  const headingTokens = tokenize(top?.chunk.heading ?? "");
  const headingMatch = clamp01(
    queryTokens.filter((token) => headingTokens.includes(token)).length /
      Math.max(1, queryTokens.length),
  );

  const snippetLength = normalizeText(top?.chunk.content ?? "").length;
  const snippetQuality = clamp01(Math.min(1, snippetLength / 320));

  const ageDays = Math.max(
    0,
    (referenceTimestampMs - Date.parse(top?.chunk.createdAt ?? new Date().toISOString())) /
      (1000 * 60 * 60 * 24),
  );
  const freshnessSignals = clamp01(1 - Math.min(1, ageDays / 365));

  return clamp01(
    entityMatch * 0.3 +
      claimDensity * 0.2 +
      headingMatch * 0.15 +
      snippetQuality * 0.2 +
      freshnessSignals * 0.15,
  );
};

export const simulateAeoVisibility = (input: {
  queries: GeneratedQuery[];
  chunks: RetrievalChunk[];
  nowIso?: string;
}): AuditSimulationOutput => {
  const referenceTimestampMs = Date.parse(input.nowIso ?? new Date().toISOString());
  const queryResults: QuerySimulation[] = input.queries.map((queryItem) => {
    const ranked = rankChunks(queryItem.query, input.chunks, 5);
    const topRelevance = ranked[0]?.score ?? 0;
    const normalizedRelevance = clamp01(topRelevance / 6);
    const citationLikelihood = computeCitationLikelihood(
      queryItem.query,
      ranked,
      referenceTimestampMs,
    );
    const score = Math.round(clamp01(normalizedRelevance * 0.55 + citationLikelihood * 0.45) * 100);

    return {
      query: queryItem.query,
      category: queryItem.category,
      score,
      citationLikelihood: Number(citationLikelihood.toFixed(4)),
      topChunkIds: ranked.map((item) => item.chunk.id),
    };
  });

  const totalScore = Math.round(
    queryResults.reduce((sum, row) => sum + row.score, 0) / Math.max(1, queryResults.length),
  );

  const sorted = [...queryResults].sort((a, b) => b.score - a.score);
  const topWinningQueries = sorted.slice(0, 10).map((row) => row.query);

  const categoryScores = new Map<string, number[]>();
  for (const row of queryResults) {
    categoryScores.set(row.category, [...(categoryScores.get(row.category) ?? []), row.score]);
  }
  const weakAreas = Array.from(categoryScores.entries())
    .map(([category, scores]) => ({
      category,
      avg: scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length),
    }))
    .filter((item) => item.avg < totalScore || item.avg < 55)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 3)
    .map((item) => item.category);

  const recommendedActions = [
    "Add richer claim-backed snippets in top service pages with clear evidence language.",
    "Align heading structure to high-value query intents and comparison modifiers.",
    "Publish trust pages covering licensing, certifications, and review highlights.",
    "Expand localized landing content where near-me demand exists.",
  ];

  const findings = [
    `Average query visibility score is ${totalScore}/100.`,
    `Top-performing queries: ${topWinningQueries.slice(0, 3).join("; ") || "none"}.`,
    weakAreas.length > 0
      ? `Weakest categories: ${weakAreas.join(", ")}.`
      : "No clear weak categories detected.",
  ];

  return {
    totalScore,
    topWinningQueries,
    weakAreas,
    competitorGap: "Competitor benchmark not connected yet.",
    recommendedActions,
    findings,
    queryResults,
  };
};
