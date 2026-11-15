export type AuditStatus = "queued" | "running" | "completed" | "failed";

export type StageKey = "validate" | "robots" | "crawl" | "analyze" | "score";

export const STAGES: { key: StageKey; label: string }[] = [
  { key: "validate", label: "Validating the address" },
  { key: "robots", label: "Reading robots.txt and sitemap" },
  { key: "crawl", label: "Fetching public pages" },
  { key: "analyze", label: "Analyzing content and structured data" },
  { key: "score", label: "Scoring and building recommendations" },
];

/** Progress is reported from real pipeline events only; there is no percentage. */
export interface AuditProgress {
  stage: StageKey;
  stagesDone: StageKey[];
  pagesFetched: number;
  pagesPlanned: number;
}

export interface FetchResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  contentType: string;
  body: string;
  bytes: number;
  truncated: boolean;
  redirects: string[];
  elapsedMs: number;
}

export interface FetchOptions {
  timeoutMs: number;
  maxBytes: number;
  accept?: string;
}

export type Fetcher = (url: string, opts: FetchOptions) => Promise<FetchResult>;

export interface SchemaItem {
  types: string[];
  name?: string;
  telephone?: string;
  url?: string;
  email?: string;
  streetAddress?: string;
  locality?: string;
  region?: string;
  postalCode?: string;
  areaServed: string[];
  sameAs: string[];
  hasOpeningHours: boolean;
  hasAggregateRating: boolean;
  hasReview: boolean;
}

export interface PageLink {
  href: string;
  text: string;
}

export interface PageData {
  url: string;
  status: number;
  elapsedMs: number;
  bytes: number;
  title: string;
  metaDescription: string;
  canonical: string;
  noindex: boolean;
  lang: string;
  hasViewport: boolean;
  h1: string[];
  h2: string[];
  h3Count: number;
  wordCount: number;
  ogSiteName: string;
  schema: SchemaItem[];
  schemaParseErrors: number;
  schemaBlocks: number;
  internalLinks: PageLink[];
  externalLinkCount: number;
  socialLinks: string[];
  phones: string[];
  emails: string[];
  hasTelLink: boolean;
  hasForm: boolean;
  hasPrivacyLink: boolean;
  imagesTotal: number;
  imagesWithAlt: number;
  questionHeadings: string[];
  listCount: number;
  tableCount: number;
  cityMentions: string[];
  trustSignals: { reviews: boolean; licensing: string[]; tenure: string[] };
  /** Lower-cased visible text, capped. Used for analysis; stripped before storage. */
  text?: string;
}

export interface FetchLogEntry {
  url: string;
  status: number | null;
  ms: number;
  bytes: number;
  note?: string;
}

export interface AiCrawlerAccess {
  agent: string;
  operator: string;
  purpose: string;
  allowed: boolean;
}

export interface CrawlResult {
  inputUrl: string;
  finalUrl: string;
  origin: string;
  robots: {
    status: "found" | "missing" | "error";
    httpStatus: number | null;
    sitemapsDeclared: string[];
    blocksAllCrawlers: boolean;
    aiCrawlers: AiCrawlerAccess[];
  };
  sitemap: { found: boolean; url: string | null; urlCount: number };
  pages: PageData[];
  skippedByRobots: string[];
  brokenInternalLinks: { url: string; status: number | null }[];
  fetchLog: FetchLogEntry[];
  homepageRedirects: string[];
}

export type CheckStatus = "pass" | "partial" | "fail";

export type CategoryKey =
  | "technical"
  | "structuredData"
  | "content"
  | "identity"
  | "trust"
  | "aiStructure";

export interface CheckResult {
  id: string;
  category: CategoryKey;
  label: string;
  /** 0..1 share of this check that was earned. */
  ratio: number;
  status: CheckStatus;
  max: number;
  earned: number;
  evidence: string[];
}

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  max: number;
  earned: number;
}

export interface ReadinessScore {
  score: number;
  categories: CategoryScore[];
  checks: CheckResult[];
}

export interface Recommendation {
  id: string;
  checkId: string;
  title: string;
  problem: string;
  evidence: string[];
  businessImpact: string;
  action: string;
  effort: "Low" | "Medium" | "High";
  priority: "High" | "Medium" | "Low";
  implementation: string[];
  verification: string;
  pointsAvailable: number;
}

export type PromptIntent = "informational" | "comparison" | "commercial" | "local" | "urgent";

export interface SearchPrompt {
  question: string;
  intent: PromptIntent;
}

export interface Detected<T> {
  value: T;
  /** Where the value came from, shown to the user. */
  source: string;
}

export interface BusinessProfile {
  name: Detected<string> | null;
  industry: (Detected<string> & { key: string }) | null;
  services: { name: string; foundOn: string }[];
  locations: Detected<string[]> | null;
  phone: string | null;
}

export interface ProviderStatus {
  key: string;
  name: string;
  status: "not_measured";
  note: string;
}

export interface AuditResult {
  engineVersion: string;
  inputUrl: string;
  finalUrl: string;
  auditedAt: string;
  business: BusinessProfile;
  readiness: ReadinessScore;
  recommendations: Recommendation[];
  prompts: SearchPrompt[];
  providers: ProviderStatus[];
  crawl: Omit<CrawlResult, "pages" | "fetchLog"> & {
    pages: Omit<PageData, "text" | "internalLinks">[];
  };
  stats: {
    durationMs: number;
    requests: number;
    pagesAnalyzed: number;
    bytesDownloaded: number;
    /** Phase 2 uses deterministic code only, so no paid API calls are made. */
    paidApiCostUsd: number;
  };
}

export class AuditError extends Error {
  constructor(
    public code:
      | "INVALID_URL"
      | "BLOCKED_ADDRESS"
      | "UNREACHABLE"
      | "ROBOTS_DISALLOWED"
      | "NOT_HTML"
      | "TIMEOUT"
      | "INTERNAL",
    message: string,
  ) {
    super(message);
    this.name = "AuditError";
  }
}
