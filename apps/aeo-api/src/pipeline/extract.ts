const SERVICE_KEYWORDS = [
  "insurance",
  "coverage",
  "policy",
  "quote",
  "claims",
  "brokerage",
  "consulting",
  "compliance",
  "risk",
  "audit",
];

export type ExtractedFaq = {
  question: string;
  answer: string;
};

export type ExtractedSignals = {
  normalizedText: string;
  faqs: ExtractedFaq[];
  services: string[];
  entities: string[];
};

export const normalizeText = (input: string): string =>
  input.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();

const isQuestionHeading = (heading: string): boolean => {
  const normalized = heading.trim();
  if (normalized.endsWith("?")) {
    return true;
  }
  return /^(what|how|why|when|where|can|does|do|is|are|should)\b/i.test(normalized);
};

export const extractFaqs = (headings: string[], paragraphs: string[]): ExtractedFaq[] => {
  const faqs: ExtractedFaq[] = [];

  for (let index = 0; index < headings.length; index += 1) {
    const question = normalizeText(headings[index] ?? "");
    if (!question || !isQuestionHeading(question)) {
      continue;
    }

    const answerCandidate = normalizeText(paragraphs[index] ?? paragraphs[index + 1] ?? "");
    if (!answerCandidate) {
      continue;
    }

    faqs.push({
      question,
      answer: answerCandidate,
    });
  }

  return faqs;
};

export const extractServicesAndEntities = (
  text: string,
): { services: string[]; entities: string[] } => {
  const normalized = normalizeText(text).toLowerCase();
  const services = SERVICE_KEYWORDS.filter((keyword) => normalized.includes(keyword));

  const entities = Array.from(
    new Set(
      normalizeText(text)
        .match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g)
        ?.map((entity) => entity.trim())
        .filter((entity) => entity.length > 2) ?? [],
    ),
  ).slice(0, 25);

  return { services, entities };
};

export const extractSignals = (input: {
  mainText: string;
  headings: string[];
  paragraphs: string[];
}): ExtractedSignals => {
  const normalizedText = normalizeText(input.mainText);
  const faqs = extractFaqs(input.headings, input.paragraphs);
  const { services, entities } = extractServicesAndEntities(normalizedText);

  return {
    normalizedText,
    faqs,
    services,
    entities,
  };
};
