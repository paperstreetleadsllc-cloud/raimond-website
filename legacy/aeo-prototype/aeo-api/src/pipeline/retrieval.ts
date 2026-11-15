import { normalizeText } from "./extract.js";

export type RetrievalChunk = {
  id: string;
  sourceUrl: string;
  heading?: string;
  content: string;
  createdAt: string;
};

export type RankedChunk = {
  chunk: RetrievalChunk;
  score: number;
};

const tokenize = (text: string): string[] =>
  normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

const termFrequency = (tokens: string[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
};

export const rankChunks = (
  query: string,
  chunks: RetrievalChunk[],
  limit = 5,
): RankedChunk[] => {
  if (chunks.length === 0) {
    return [];
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return chunks.slice(0, limit).map((chunk) => ({ chunk, score: 0 }));
  }

  const docTokens = chunks.map((chunk) => tokenize(`${chunk.heading ?? ""} ${chunk.content}`));
  const docFreq = new Map<string, number>();
  const avgDocLen =
    docTokens.reduce((sum, tokens) => sum + tokens.length, 0) / Math.max(1, chunks.length);

  for (const tokens of docTokens) {
    const unique = new Set(tokens);
    for (const token of unique) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }

  const k1 = 1.2;
  const b = 0.75;

  const bm25Scores = chunks.map((chunk, index) => {
    const tf = termFrequency(docTokens[index] ?? []);
    const docLength = docTokens[index]?.length ?? 0;
    let score = 0;

    for (const token of queryTokens) {
      const freq = tf.get(token) ?? 0;
      if (freq === 0) {
        continue;
      }
      const df = docFreq.get(token) ?? 0;
      const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
      const numerator = freq * (k1 + 1);
      const denominator = freq + k1 * (1 - b + b * (docLength / Math.max(1, avgDocLen)));
      score += idf * (numerator / Math.max(1e-9, denominator));
    }

    if (score === 0) {
      const content = `${chunk.heading ?? ""} ${chunk.content}`.toLowerCase();
      const fallback = queryTokens.reduce(
        (sum, token) => sum + (content.includes(token) ? 1 : 0),
        0,
      );
      score = fallback * 0.1;
    }

    return { chunk, score };
  });

  return bm25Scores
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id))
    .slice(0, limit);
};
