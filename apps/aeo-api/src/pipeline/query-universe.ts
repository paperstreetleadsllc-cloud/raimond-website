import { normalizeText } from "./extract.js";

export type SiteProfile = {
  businessName?: string;
  vertical?: string;
  services: string[];
  entities: string[];
  faqQuestions: string[];
  headings: string[];
  locations: string[];
  pageCount: number;
  chunkCount: number;
};

type QueryCategory =
  | "informational"
  | "comparison"
  | "pricing"
  | "local-near-me"
  | "trust-legitimacy";

export type GeneratedQuery = {
  query: string;
  category: QueryCategory;
};

const uniqueStrings = (values: string[]): string[] =>
  Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));

const slugWords = (value: string): string[] =>
  normalizeText(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((part) => part.length > 2);

const extractLocations = (entities: string[]): string[] => {
  const locationPattern =
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})(?:,\s*[A-Z]{2})?\b/g;
  const candidates = entities
    .flatMap((entity) => entity.match(locationPattern) ?? [])
    .filter((token) => token.split(" ").length <= 3);
  return uniqueStrings(candidates).slice(0, 20);
};

const targetCountFromProfile = (profile: SiteProfile): number => {
  const sizeSignal = profile.pageCount * 4 + profile.chunkCount;
  const raw = 200 + sizeSignal * 2;
  return Math.max(200, Math.min(500, raw));
};

const buildTopicPool = (profile: SiteProfile): string[] => {
  const source = [
    profile.businessName ?? "",
    profile.vertical ?? "",
    ...profile.services,
    ...profile.entities,
    ...profile.faqQuestions.map((question) => question.replace(/\?$/, "")),
    ...profile.headings,
  ];

  const phraseTopics = uniqueStrings(source).slice(0, 100);
  const tokenTopics = uniqueStrings(phraseTopics.flatMap((item) => slugWords(item))).slice(0, 120);

  const defaults = [
    "life insurance",
    "coverage options",
    "policy advice",
    "insurance quote",
    "risk protection",
  ];

  return uniqueStrings([...phraseTopics, ...tokenTopics, ...defaults]);
};

export const createSiteProfile = (input: {
  businessName?: string;
  vertical?: string;
  services: string[];
  entities: string[];
  faqQuestions: string[];
  headings: string[];
  locations?: string[];
  pageCount: number;
  chunkCount: number;
}): SiteProfile => {
  const inferredLocations = extractLocations(input.entities);
  return {
    businessName: input.businessName,
    vertical: input.vertical,
    services: uniqueStrings(input.services),
    entities: uniqueStrings(input.entities),
    faqQuestions: uniqueStrings(input.faqQuestions),
    headings: uniqueStrings(input.headings),
    locations: uniqueStrings([...(input.locations ?? []), ...inferredLocations]),
    pageCount: input.pageCount,
    chunkCount: input.chunkCount,
  };
};

export const generateQueryUniverse = (profile: SiteProfile): GeneratedQuery[] => {
  const targetCount = targetCountFromProfile(profile);
  const topics = buildTopicPool(profile);
  const brand = profile.businessName ?? topics[0] ?? "this provider";
  const vertical = profile.vertical ?? "insurance";
  const locations = profile.locations.length > 0 ? profile.locations : [];

  const informational = [
    "what is {topic}",
    "how does {topic} work",
    "best practices for {topic}",
    "common mistakes in {topic}",
    "{topic} guide",
  ];
  const comparison = [
    "{topic} vs alternatives",
    "compare {topic} providers",
    "{topic} versus competitor options",
    "is {topic} better than traditional plans",
  ];
  const pricing = [
    "{topic} pricing",
    "cost of {topic}",
    "{topic} monthly premium",
    "affordable {topic} plans",
  ];
  const localNearMe = [
    "{topic} near me",
    "best {topic} in {location}",
    "{brand} {topic} {location}",
  ];
  const trustLegitimacy = [
    "is {brand} licensed",
    "is {brand} certified",
    "{brand} reviews",
    "is {brand} legit for {topic}",
    "{brand} trust score",
  ];

  const generated: GeneratedQuery[] = [];
  const seen = new Set<string>();

  const push = (query: string, category: QueryCategory) => {
    const normalized = normalizeText(query.toLowerCase());
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    generated.push({ query: normalized, category });
  };

  for (const topic of topics) {
    for (const template of informational) {
      push(
        template
          .replaceAll("{topic}", topic)
          .replaceAll("{brand}", brand)
          .replaceAll("{vertical}", vertical),
        "informational",
      );
    }
    for (const template of comparison) {
      push(
        template
          .replaceAll("{topic}", topic)
          .replaceAll("{brand}", brand)
          .replaceAll("{vertical}", vertical),
        "comparison",
      );
    }
    for (const template of pricing) {
      push(
        template
          .replaceAll("{topic}", topic)
          .replaceAll("{brand}", brand)
          .replaceAll("{vertical}", vertical),
        "pricing",
      );
    }
    if (locations.length > 0) {
      for (const location of locations) {
        for (const template of localNearMe) {
          push(
            template
              .replaceAll("{topic}", topic)
              .replaceAll("{brand}", brand)
              .replaceAll("{location}", location),
            "local-near-me",
          );
        }
      }
    }
    for (const template of trustLegitimacy) {
      push(
        template
          .replaceAll("{topic}", topic)
          .replaceAll("{brand}", brand)
          .replaceAll("{vertical}", vertical),
        "trust-legitimacy",
      );
    }
    if (generated.length >= targetCount) {
      break;
    }
  }

  let padIndex = 1;
  const categoryCycle: QueryCategory[] = [
    "informational",
    "comparison",
    "pricing",
    "trust-legitimacy",
    "local-near-me",
  ];

  while (generated.length < targetCount) {
    const topic = topics[padIndex % topics.length] ?? vertical;
    const category = categoryCycle[padIndex % categoryCycle.length] as QueryCategory;
    const suffix = category === "local-near-me" && locations.length > 0
      ? ` ${locations[padIndex % locations.length]}`
      : "";
    push(`${topic} ${vertical} questions ${padIndex}${suffix}`, category);
    padIndex += 1;
  }

  return generated.slice(0, targetCount);
};
