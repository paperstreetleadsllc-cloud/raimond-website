import { createHash, randomUUID } from "node:crypto";
import { runAudit } from "./audit/pipeline";
import { AuditError, type AuditResult } from "./audit/types";
import { normalizeInputUrl, siteKey } from "./audit/url";
import { getStore, type AuditRecord } from "./store";

/** Free-tier limits. Explicit so the free audit can never run up a bill. */
export const FREE_LIMITS = {
  auditsPerIpPerHour: 5,
  auditsPerDayGlobal: 500,
  cacheHours: 24,
  recommendationsShown: 3,
  /** A running audit with no update for this long is considered dead. */
  staleAfterMs: 120_000,
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "raimondai-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/**
 * Creates an audit, or returns a recent one for the same site. Returns the
 * record plus whether work still needs to be kicked off.
 */
export async function requestAudit(input: string, ip: string): Promise<{ audit: AuditRecord; reused: boolean }> {
  const inputUrl = normalizeInputUrl(input);
  const key = siteKey(inputUrl);
  const store = getStore();
  const ipHash = hashIp(ip);

  // De-duplicate first: repeat and concurrent requests for a site share one audit.
  const recent = await store.findRecentBySite(key, hoursAgo(FREE_LIMITS.cacheHours));
  if (recent && !isStale(recent)) return { audit: recent, reused: true };

  if ((await store.countByIpSince(ipHash, hoursAgo(1))) >= FREE_LIMITS.auditsPerIpPerHour) {
    throw new RateLimitError("You've reached the limit for free audits this hour. Please try again later.");
  }
  if ((await store.countSince(hoursAgo(24))) >= FREE_LIMITS.auditsPerDayGlobal) {
    throw new RateLimitError("Free audits are at capacity today. Please try again tomorrow.");
  }

  const now = new Date().toISOString();
  const audit: AuditRecord = {
    id: randomUUID(),
    siteKey: key,
    inputUrl,
    status: "queued",
    progress: null,
    result: null,
    error: null,
    ipHash,
    createdAt: now,
    updatedAt: now,
  };
  await store.createAudit(audit);
  return { audit, reused: false };
}

export function isStale(audit: AuditRecord): boolean {
  if (audit.status !== "queued" && audit.status !== "running") return false;
  return Date.now() - new Date(audit.updatedAt).getTime() > FREE_LIMITS.staleAfterMs;
}

/** Runs the audit and records progress and the outcome. Never throws. */
export async function processAudit(id: string): Promise<void> {
  const store = getStore();
  const audit = await store.getAudit(id);
  if (!audit || audit.status !== "queued") return; // idempotent: already picked up
  try {
    await store.updateAudit(id, { status: "running" });
    const result = await runAudit(audit.inputUrl, {
      onProgress: (progress) => store.updateAudit(id, { progress }).catch(() => undefined),
    });
    await store.updateAudit(id, { status: "completed", result });
    console.log(JSON.stringify({ event: "audit_completed", id, site: audit.siteKey, ms: result.stats.durationMs, pages: result.stats.pagesAnalyzed, score: result.readiness.score }));
  } catch (err) {
    const known = err instanceof AuditError;
    const error = known
      ? { code: err.code, message: err.message }
      : { code: "INTERNAL", message: "Something went wrong on our side while auditing this site." };
    console.error(JSON.stringify({ event: "audit_failed", id, site: audit.siteKey, code: error.code, detail: known ? undefined : String(err) }));
    await store.updateAudit(id, { status: "failed", error }).catch(() => undefined);
  }
}

/** What the browser is allowed to see for an audit. */
export function toPublicAudit(audit: AuditRecord) {
  const stale = isStale(audit);
  const result: (AuditResult & { moreRecommendations: number }) | null = audit.result
    ? {
        ...audit.result,
        recommendations: audit.result.recommendations.slice(0, FREE_LIMITS.recommendationsShown),
        moreRecommendations: Math.max(0, audit.result.recommendations.length - FREE_LIMITS.recommendationsShown),
      }
    : null;
  return {
    id: audit.id,
    inputUrl: audit.inputUrl,
    status: stale ? ("failed" as const) : audit.status,
    progress: audit.progress,
    error: stale ? { code: "TIMEOUT", message: "This audit stopped responding. Please run it again." } : audit.error,
    result,
    createdAt: audit.createdAt,
  };
}

export type PublicAudit = ReturnType<typeof toPublicAudit>;
