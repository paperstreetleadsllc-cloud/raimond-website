import { createHash } from "node:crypto";
import {
  ActionPlanSchema,
  type ActionPlan,
  type ActionPlanItem,
  type AuditResult,
  type Site,
} from "../domain/types.js";

type PlanInput = {
  site: Site;
  latestAudit: AuditResult;
  extractedEntities: string[];
  topQueries: string[];
  nowIso?: string;
};

const stableHash = (value: string): string =>
  createHash("sha256").update(value).digest("hex").slice(0, 16);

const stableId = (prefix: string, seed: string): string => `${prefix}_${stableHash(seed)}`;

const normalize = (value: string): string => value.trim().replace(/\s+/g, " ");

const unique = (values: string[]): string[] =>
  Array.from(
    new Set(
      values
        .map((value) => normalize(value))
        .filter((value) => value.length > 0),
    ),
  );

const createSeededRandom = (seed: string): (() => number) => {
  let state = 0;
  for (let index = 0; index < seed.length; index += 1) {
    state = (state * 31 + seed.charCodeAt(index)) >>> 0;
  }
  if (state === 0) {
    state = 0x9e3779b9;
  }
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
};

const pick = <T>(pool: T[], count: number, random: () => number): T[] => {
  const copy = [...pool];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap] as T, copy[index] as T];
  }
  return copy.slice(0, Math.max(0, Math.min(count, copy.length)));
};

const clusterForQuery = (query: string): string => {
  const lowercase = query.toLowerCase();
  if (lowercase.includes("near me") || lowercase.includes(" in ")) {
    return "local-intent";
  }
  if (lowercase.includes("price") || lowercase.includes("cost") || lowercase.includes("quote")) {
    return "pricing-intent";
  }
  if (lowercase.includes("vs") || lowercase.includes("compare")) {
    return "comparison-intent";
  }
  if (
    lowercase.includes("licensed") ||
    lowercase.includes("reviews") ||
    lowercase.includes("certified") ||
    lowercase.includes("legit")
  ) {
    return "trust-intent";
  }
  return "education-intent";
};

const deriveTopics = (input: {
  topQueries: string[];
  entities: string[];
  businessName?: string;
  vertical?: string;
}): string[] => {
  const queryTopics = input.topQueries.map((query) =>
    query
      .toLowerCase()
      .replace(/\b(what|how|best|is|the|a|an|for|in|near|me|vs|versus)\b/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  const defaults = [
    input.vertical ?? "insurance coverage",
    `${input.vertical ?? "insurance"} pricing`,
    `${input.vertical ?? "insurance"} comparison`,
    input.businessName ? `${input.businessName} services` : "service options",
  ];
  return unique([...queryTopics, ...input.entities, ...defaults]).slice(0, 24);
};

const buildFaqSchema = (questions: string[], businessName: string): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.slice(0, 6).map((question) => ({
    "@type": "Question",
    name: question.endsWith("?") ? question : `${question}?`,
    acceptedAnswer: {
      "@type": "Answer",
      text: `${businessName} should provide a direct, evidence-backed answer to this question in 2-4 sentences.`,
    },
  })),
});

const buildOrganizationSchema = (site: Site, services: string[]): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.businessName ?? new URL(site.url).host,
  url: site.url,
  knowsAbout: unique(services).slice(0, 10),
});

const buildServiceSchema = (site: Site, services: string[]): Record<string, unknown> => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: unique(services)[0] ?? site.vertical ?? "Insurance service",
  provider: {
    "@type": "Organization",
    name: site.businessName ?? new URL(site.url).host,
    url: site.url,
  },
  areaServed: "US",
});

const createItem = (
  planId: string,
  index: number,
  item: Omit<ActionPlanItem, "id">,
): ActionPlanItem => ({
  ...item,
  id: stableId("planitem", `${planId}|${index}|${item.title}`),
});

export const generateActionPlan = (input: PlanInput): ActionPlan => {
  const createdAt = input.nowIso ?? new Date().toISOString();
  const planId = stableId("plan", `${input.site.id}|${createdAt}`);
  const random = createSeededRandom(input.site.id);

  const businessName = input.site.businessName ?? new URL(input.site.url).host;
  const topQueries = unique(
    input.topQueries.length > 0 ? input.topQueries : input.latestAudit.topWinningQueries,
  );
  const entities = unique(input.extractedEntities).slice(0, 18);
  const topics = deriveTopics({
    topQueries,
    entities,
    businessName: input.site.businessName,
    vertical: input.site.vertical,
  });
  const weakAreas = input.latestAudit.weakAreas.slice(0, 3);

  const faqQuestions = unique(
    topQueries
      .filter((query) => /\b(what|how|why|when|where|can|does|is|are|should)\b/i.test(query))
      .slice(0, 6),
  );
  const faqFallback = [
    `What does ${businessName} include in ${input.site.vertical ?? "its"} plans`,
    `How do I compare ${businessName} against alternatives`,
    `When should I request a quote`,
  ];
  const faqSource = faqQuestions.length > 0 ? faqQuestions : faqFallback;

  const longTailIdeas = Array.from({ length: 10 }, (_, index) => {
    const topic = topics[index % topics.length] ?? `${input.site.vertical ?? "insurance"} planning`;
    const queryHint = topQueries[index % Math.max(1, topQueries.length)] ?? topic;
    const title = `${topic.replace(/\b\w/g, (char) => char.toUpperCase())}: Answering "${queryHint}"`;
    const sections = [
      `What ${topic} means for buyers`,
      `Key factors that impact ${topic}`,
      `${businessName} approach to ${topic}`,
      `How to evaluate options and next steps`,
    ];
    return {
      title,
      sections,
    };
  });

  const queryClusters = new Map<string, string[]>();
  for (const query of topQueries) {
    const cluster = clusterForQuery(query);
    queryClusters.set(cluster, [...(queryClusters.get(cluster) ?? []), query]);
  }
  const clusterEntries = Array.from(queryClusters.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  const adAngles = clusterEntries.slice(0, 5).map(([cluster, queries]) => {
    const seedQuery = queries[0] ?? `${input.site.vertical ?? "insurance"} help`;
    const angleLabel = cluster.replace("-intent", "").replace("-", " ");
    return {
      angle: `Lead with ${angleLabel} proof`,
      headline: `${businessName}: ${seedQuery.replace(/\b\w/g, (char) => char.toUpperCase())}`,
      body: `Answer the intent behind "${seedQuery}" with one clear value prop and one trust proof.`,
    };
  });
  while (adAngles.length < 5) {
    const topic = topics[adAngles.length % topics.length] ?? "coverage planning";
    adAngles.push({
      angle: "Lead with expert guidance",
      headline: `${businessName} | ${topic.replace(/\b\w/g, (char) => char.toUpperCase())}`,
      body: `Show a concise benefit and direct CTA for "${topic}".`,
    });
  }

  const calendarTopics = pick(topics, 7, random);
  const contentCalendar = calendarTopics.map(
    (topic, index) =>
      `Day ${index + 1}: ${topic.replace(/\b\w/g, (char) => char.toUpperCase())} - practical guide`,
  );

  const baseItems: Omit<ActionPlanItem, "id">[] = [
    {
      title: "Deploy FAQ schema for answer intent capture",
      priority: "P0",
      category: "schema",
      estimatedImpact: "High",
      effort: "Medium",
      instructions: [
        "Create or update a visible FAQ section on core pages.",
        "Keep each answer specific, concise, and evidence-backed.",
        "Embed JSON-LD after validating through Rich Results testing.",
      ],
      deliverables: [
        {
          type: "jsonld",
          label: "FAQ schema JSON-LD",
          json: buildFaqSchema(faqSource, businessName),
        },
      ],
    },
    {
      title: "Add Organization and Service schema baseline",
      priority: "P0",
      category: "schema",
      estimatedImpact: "High",
      effort: "Low",
      instructions: [
        "Publish Organization schema on global template.",
        "Add one Service schema block to priority service landing pages.",
        "Align serviceType and knowsAbout with on-page copy.",
      ],
      deliverables: [
        {
          type: "jsonld",
          label: "Organization schema JSON-LD",
          json: buildOrganizationSchema(input.site, topics),
        },
        {
          type: "jsonld",
          label: "Service schema JSON-LD",
          json: buildServiceSchema(input.site, topics),
        },
      ],
    },
    {
      title: "Publish 10 long-tail query pages",
      priority: "P1",
      category: "content",
      estimatedImpact: "High",
      effort: "Medium",
      instructions: [
        "Create one page per long-tail topic with direct intent match.",
        "Keep intro copy short and lead with answer-first language.",
        "Use one CTA per page tied to quote or consultation.",
      ],
      deliverables: longTailIdeas.map((idea, index) => ({
        type: "outline" as const,
        label: `Long-tail page ${index + 1}: ${idea.title}`,
        sections: idea.sections,
      })),
    },
    {
      title: "Launch paid ad messaging by query cluster",
      priority: "P1",
      category: "paid-media",
      estimatedImpact: "Medium",
      effort: "Low",
      instructions: [
        "Map each angle to a dedicated campaign or ad group.",
        "Use landing pages that mirror headline intent exactly.",
        "Test at least two CTA variants per angle.",
      ],
      deliverables: [
        {
          type: "copy",
          label: "5 ad angles with headlines",
          text: adAngles
            .map(
              (angle, index) =>
                `${index + 1}. Angle: ${angle.angle}\nHeadline: ${angle.headline}\nBody: ${angle.body}`,
            )
            .join("\n\n"),
        },
      ],
    },
    {
      title: "Roll out a 7-day content sprint",
      priority: "P1",
      category: "editorial",
      estimatedImpact: "Medium",
      effort: "Low",
      instructions: [
        "Assign one owner and one reviewer for each day.",
        "Publish title-first drafts quickly, then refine intros and CTA.",
        "Repurpose top-performing pieces into social snippets.",
      ],
      deliverables: [
        {
          type: "copy",
          label: "7-day content calendar",
          text: contentCalendar.join("\n"),
        },
      ],
    },
    {
      title: "Resolve weak area coverage gaps",
      priority: "P0",
      category: "content-strategy",
      estimatedImpact: "High",
      effort: "Medium",
      instructions: [
        `Current weak areas: ${weakAreas.join(", ") || "none detected; prioritize lower-performing queries."}`,
        "Build one focused section per weak area on relevant landing pages.",
        "Add 2-3 trust and proof statements per weak area section.",
      ],
      deliverables: [
        {
          type: "copy",
          label: "Weak-area brief",
          text: weakAreas.length > 0 ? weakAreas.join("\n") : "No weak areas detected in latest audit.",
        },
      ],
    },
    {
      title: "Prioritize top winning query refreshes",
      priority: "P1",
      category: "optimization",
      estimatedImpact: "Medium",
      effort: "Low",
      instructions: [
        "Refresh intros and meta descriptions for top performers.",
        "Add updated stats, examples, or pricing context where possible.",
        "Track query-level movement weekly after refreshes.",
      ],
      deliverables: [
        {
          type: "copy",
          label: "Top queries to refresh",
          text: topQueries.slice(0, 12).join("\n"),
        },
      ],
    },
    {
      title: "Build trust-proof section templates",
      priority: "P2",
      category: "conversion",
      estimatedImpact: "Medium",
      effort: "Medium",
      instructions: [
        "Create reusable trust module with licensing, review, and guarantee proof.",
        "Place trust module near hero and near primary CTA.",
        "Standardize proof statements across service pages.",
      ],
      deliverables: [
        {
          type: "copy",
          label: "Trust module copy starter",
          text: [
            "Licensed and compliant in applicable jurisdictions.",
            "Transparent quote process with no hidden surprises.",
            "Documented customer outcomes and verified testimonials.",
          ].join("\n"),
        },
      ],
    },
  ];

  const actionItems = input.latestAudit.recommendedActions
    .slice(0, 4)
    .map<Omit<ActionPlanItem, "id">>((recommendation, index) => ({
      title: `Execute recommended action ${index + 1}`,
      priority: index === 0 ? "P0" : "P1",
      category: "audit-recommendation",
      estimatedImpact: index === 0 ? "High" : "Medium",
      effort: "Low",
      instructions: [
        recommendation,
        "Assign owner and due date.",
        "Capture before/after query visibility metrics.",
      ],
      deliverables: [
        {
          type: "copy",
          label: `Recommended action ${index + 1}`,
          text: recommendation,
        },
      ],
    }));

  const mergedItems = [...baseItems, ...actionItems].slice(0, 20);
  const selectedItems = mergedItems.slice(0, Math.max(8, Math.min(20, mergedItems.length)));
  const items = selectedItems.map((item, index) => createItem(planId, index, item));

  const summary = [
    `${businessName} scored ${input.latestAudit.totalScore}/100 in the latest audit.`,
    `This plan prioritizes ${items.filter((item) => item.priority === "P0").length} P0 actions and ${items.length} total tasks.`,
    `Primary weak areas: ${weakAreas.join(", ") || "none detected"}.`,
  ].join(" ");

  return ActionPlanSchema.parse({
    id: planId,
    siteId: input.site.id,
    createdAt,
    summary,
    items,
  });
};
