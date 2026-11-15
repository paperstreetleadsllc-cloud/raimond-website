import { detectBusiness } from "./business";
import { crawlSite, FREE_AUDIT_LIMITS, type CrawlLimits } from "./crawl";
import { safeFetch } from "./net";
import { generatePrompts, providerStatuses } from "./prompts";
import { buildRecommendations } from "./recommendations";
import { DEFAULT_SCORING, scoreReadiness, type ScoringConfig } from "./score";
import type { AuditProgress, AuditResult, Fetcher, StageKey } from "./types";
import { normalizeInputUrl } from "./url";

export const ENGINE_VERSION = "0.1.0";

export interface RunAuditOptions {
  fetcher?: Fetcher;
  limits?: CrawlLimits;
  scoring?: ScoringConfig;
  onProgress?: (progress: AuditProgress) => void | Promise<void>;
}

/**
 * Runs a complete readiness audit for one website. Deterministic: the same
 * HTML produces the same result, and no paid API is called.
 */
export async function runAudit(input: string, options: RunAuditOptions = {}): Promise<AuditResult> {
  const started = Date.now();
  const startUrl = normalizeInputUrl(input);

  let last: AuditProgress = { stage: "validate", stagesDone: [], pagesFetched: 0, pagesPlanned: 0 };
  const emit = async (p: AuditProgress) => {
    last = p;
    await options.onProgress?.(p);
  };
  const advance = (stage: StageKey, done: StageKey[]) => emit({ ...last, stage, stagesDone: done });

  await emit(last);
  const crawl = await crawlSite({
    startUrl,
    fetcher: options.fetcher ?? safeFetch,
    limits: options.limits ?? FREE_AUDIT_LIMITS,
    onProgress: emit,
  });

  await advance("analyze", ["validate", "robots", "crawl"]);
  const business = detectBusiness(crawl.pages, new URL(crawl.finalUrl).hostname);

  await advance("score", ["validate", "robots", "crawl", "analyze"]);
  const readiness = scoreReadiness(crawl, business, options.scoring ?? DEFAULT_SCORING);
  const recommendations = buildRecommendations(readiness);

  const { pages, fetchLog, ...crawlSummary } = crawl;
  const result: AuditResult = {
    engineVersion: ENGINE_VERSION,
    inputUrl: startUrl,
    finalUrl: crawl.finalUrl,
    auditedAt: new Date().toISOString(),
    business,
    readiness,
    recommendations,
    prompts: generatePrompts(business),
    providers: providerStatuses(),
    crawl: {
      ...crawlSummary,
      pages: pages.map(({ text: _text, internalLinks: _links, ...rest }) => rest),
    },
    stats: {
      durationMs: Date.now() - started,
      requests: fetchLog.length,
      pagesAnalyzed: pages.length,
      bytesDownloaded: fetchLog.reduce((s, f) => s + f.bytes, 0),
      paidApiCostUsd: 0,
    },
  };
  await advance("score", ["validate", "robots", "crawl", "analyze", "score"]);
  return result;
}
