import { z } from "zod";

export const SiteSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  businessName: z.string().min(1).optional(),
  vertical: z.string().min(1).optional(),
  ownerEmail: z.string().email().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Site = z.infer<typeof SiteSchema>;

export const CrawlResultSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  startUrl: z.string().url(),
  status: z.enum(["queued", "running", "completed", "failed"]),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  pagesDiscovered: z.number().int().nonnegative(),
  pagesIndexed: z.number().int().nonnegative().default(0),
  notes: z.array(z.string()).default([]),
});

export type CrawlResult = z.infer<typeof CrawlResultSchema>;

export const DocumentSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  sourceUrl: z.string().url(),
  title: z.string().optional(),
  metaDescription: z.string().optional(),
  h1: z.array(z.string()).default([]),
  h2: z.array(z.string()).default([]),
  body: z.string(),
  createdAt: z.string().datetime(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const ChunkSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  siteId: z.string(),
  sourceUrl: z.string().url(),
  heading: z.string().optional(),
  index: z.number().int().nonnegative(),
  content: z.string(),
  tokenCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export type Chunk = z.infer<typeof ChunkSchema>;

export const AuditResultSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  score: z.number().int().min(0).max(100),
  totalScore: z.number().int().min(0).max(100),
  status: z.enum(["completed", "failed"]),
  findings: z.array(z.string()),
  topWinningQueries: z.array(z.string()).default([]),
  weakAreas: z.array(z.string()).default([]),
  competitorGap: z.string().default("Competitive benchmark pending"),
  recommendedActions: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
});

export type AuditResult = z.infer<typeof AuditResultSchema>;

export const ActionPlanPrioritySchema = z.enum(["P0", "P1", "P2"]);
export type ActionPlanPriority = z.infer<typeof ActionPlanPrioritySchema>;

export const JsonLdSnippetSchema = z.object({
  type: z.literal("jsonld"),
  label: z.string().min(1),
  json: z.record(z.string(), z.unknown()),
});
export type JsonLdSnippet = z.infer<typeof JsonLdSnippetSchema>;

export const CopyBlockSchema = z.object({
  type: z.literal("copy"),
  label: z.string().min(1),
  text: z.string().min(1),
});
export type CopyBlock = z.infer<typeof CopyBlockSchema>;

export const PageOutlineSchema = z.object({
  type: z.literal("outline"),
  label: z.string().min(1),
  sections: z.array(z.string().min(1)).min(1),
});
export type PageOutline = z.infer<typeof PageOutlineSchema>;

export const ActionPlanDeliverableSchema = z.discriminatedUnion("type", [
  JsonLdSnippetSchema,
  CopyBlockSchema,
  PageOutlineSchema,
]);
export type ActionPlanDeliverable = z.infer<typeof ActionPlanDeliverableSchema>;

export const ActionPlanItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  priority: ActionPlanPrioritySchema,
  category: z.string().min(1),
  estimatedImpact: z.string().min(1),
  effort: z.string().min(1),
  instructions: z.array(z.string().min(1)).min(1),
  deliverables: z.array(ActionPlanDeliverableSchema).default([]),
});
export type ActionPlanItem = z.infer<typeof ActionPlanItemSchema>;

export const ActionPlanSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  createdAt: z.string().datetime(),
  summary: z.string().min(1),
  items: z.array(ActionPlanItemSchema).min(1),
});
export type ActionPlan = z.infer<typeof ActionPlanSchema>;

export const QueryRunSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  query: z.string().min(1),
  status: z.enum(["queued", "running", "completed", "failed"]),
  createdAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
});

export type QueryRun = z.infer<typeof QueryRunSchema>;

export const CitationSchema = z.object({
  id: z.string(),
  sourceUrl: z.string().url(),
  documentId: z.string().optional(),
  chunkId: z.string().optional(),
  snippet: z.string().min(1),
});

export type Citation = z.infer<typeof CitationSchema>;

export const AnswerResultSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  queryRunId: z.string(),
  answer: z.string().min(1),
  confidence: z.number().min(0).max(1),
  citations: z.array(CitationSchema),
  createdAt: z.string().datetime(),
});

export type AnswerResult = z.infer<typeof AnswerResultSchema>;

export const CreateSiteInputSchema = z.object({
  url: z.string().url(),
  businessName: z.string().min(1).optional(),
  vertical: z.string().min(1).optional(),
  ownerEmail: z.string().email().optional(),
});

export type CreateSiteInput = z.infer<typeof CreateSiteInputSchema>;

export const RunAuditInputSchema = z.object({
  siteId: z.string().min(1),
});

export type RunAuditInput = z.infer<typeof RunAuditInputSchema>;

export const RunCrawlInputSchema = z.object({
  siteId: z.string().min(1),
});

export type RunCrawlInput = z.infer<typeof RunCrawlInputSchema>;

export const BillingPlanSchema = z.enum(["starter", "pro", "agency"]);
export type BillingPlan = z.infer<typeof BillingPlanSchema>;

export const BillingStatusSchema = z.enum([
  "none",
  "pending",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "incomplete",
]);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

export const BillingCustomerSchema = z.object({
  email: z.string().email(),
  customerId: z.string().optional(),
  subscriptionId: z.string().optional(),
  status: BillingStatusSchema.default("none"),
  plan: BillingPlanSchema.optional(),
  priceId: z.string().optional(),
  checkoutSessionId: z.string().optional(),
  updatedAt: z.string().datetime(),
});

export type BillingCustomer = z.infer<typeof BillingCustomerSchema>;

export const RunHistoryEntrySchema = z.object({
  id: z.string(),
  siteId: z.string(),
  runType: z.enum(["crawl", "audit"]),
  timestamp: z.string().datetime(),
  score: z.number().int().min(0).max(100).optional(),
  pagesIndexed: z.number().int().nonnegative().optional(),
  topWinningQueries: z.array(z.string()).default([]),
  weakAreas: z.array(z.string()).default([]),
});

export type RunHistoryEntry = z.infer<typeof RunHistoryEntrySchema>;

export const AlertRuleSchema = z.enum([
  "score_drop_week_over_week",
  "top_query_winners_lost",
  "coverage_gaps_detected",
]);
export type AlertRule = z.infer<typeof AlertRuleSchema>;

export const AlertRecordSchema = z.object({
  id: z.string(),
  siteId: z.string(),
  rule: AlertRuleSchema,
  message: z.string().min(1),
  createdAt: z.string().datetime(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export type AlertRecord = z.infer<typeof AlertRecordSchema>;
