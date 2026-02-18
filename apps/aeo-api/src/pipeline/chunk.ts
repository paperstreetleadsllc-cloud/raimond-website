import { buildStableId } from "../storage/store.js";

export type ChunkCandidate = {
  documentId: string;
  siteId: string;
  sourceUrl: string;
  heading?: string;
  text: string;
  createdAt: string;
};

export type ChunkedParagraph = {
  id: string;
  documentId: string;
  siteId: string;
  sourceUrl: string;
  heading?: string;
  index: number;
  content: string;
  tokenCount: number;
  createdAt: string;
};

const estimateTokenCount = (text: string): number =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).length * 1.2));

export const chunkByParagraphs = (
  input: ChunkCandidate,
  maxChars = 1200,
): ChunkedParagraph[] => {
  const paragraphs = input.text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  const chunks: ChunkedParagraph[] = [];
  let current = "";

  const pushChunk = () => {
    const content = current.trim();
    if (!content) {
      return;
    }
    const index = chunks.length;
    chunks.push({
      id: buildStableId(
        "chunk",
        `${input.documentId}|${input.sourceUrl}|${input.createdAt}|${index}`,
      ),
      documentId: input.documentId,
      siteId: input.siteId,
      sourceUrl: input.sourceUrl,
      heading: input.heading,
      index,
      content,
      tokenCount: estimateTokenCount(content),
      createdAt: input.createdAt,
    });
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph;
      continue;
    }

    const candidate = `${current}\n\n${paragraph}`;
    if (candidate.length > maxChars) {
      pushChunk();
      current = paragraph;
    } else {
      current = candidate;
    }
  }

  pushChunk();
  return chunks;
};
