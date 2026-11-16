import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runAudit } from "@/lib/audit/pipeline";
import { AuditError, type AuditResult } from "@/lib/audit/types";
import { FREE_LIMITS, hashIp, isStale, processAudit, RateLimitError, requestAudit, toPublicAudit } from "@/lib/service";
import { getStore, setStore, StoreNotConfiguredError, type AuditStore } from "@/lib/store";
import { FileStore } from "@/lib/store/file-store";
import { fakeSite, weakSite, WEAK_ORIGIN } from "./fixtures";

vi.mock("@/lib/audit/pipeline", async (original) => {
  const actual = await original<typeof import("@/lib/audit/pipeline")>();
  return { ...actual, runAudit: vi.fn(actual.runAudit) };
});

let dir: string;
let fixture: AuditResult;

beforeEach(async () => {
  dir = mkdtempSync(path.join(tmpdir(), "raimond-test-"));
  setStore(new FileStore(dir));
  const actual = await vi.importActual<typeof import("@/lib/audit/pipeline")>("@/lib/audit/pipeline");
  fixture = await actual.runAudit(WEAK_ORIGIN, { fetcher: fakeSite(weakSite()) });
  vi.mocked(runAudit).mockReset();
  vi.mocked(runAudit).mockImplementation(async (_url, opts) => {
    await opts?.onProgress?.({ stage: "crawl", stagesDone: ["validate", "robots"], pagesFetched: 1, pagesPlanned: 8 });
    return fixture;
  });
});

afterEach(() => {
  setStore(null);
  rmSync(dir, { recursive: true, force: true });
  vi.unstubAllEnvs();
});

describe("audit requests", () => {
  it("creates an audit, processes it, and exposes only three recommendations", async () => {
    const { audit, reused } = await requestAudit("acmeplumbing-tampa.com", "203.0.113.9");
    expect(reused).toBe(false);
    expect(audit.status).toBe("queued");
    await processAudit(audit.id);
    const saved = await getStore().getAudit(audit.id);
    expect(saved?.status).toBe("completed");
    expect(saved?.result?.recommendations.length).toBeGreaterThan(FREE_LIMITS.recommendationsShown);
    const view = toPublicAudit(saved!);
    expect(view.result?.recommendations.length).toBe(FREE_LIMITS.recommendationsShown);
    expect(view.result?.moreRecommendations).toBe(saved!.result!.recommendations.length - 3);
    expect(JSON.stringify(view)).not.toContain(saved!.ipHash);
  });

  it("reuses a recent audit for the same site instead of running a duplicate", async () => {
    const first = await requestAudit("https://www.acmeplumbing-tampa.com/services", "203.0.113.9");
    const second = await requestAudit("acmeplumbing-tampa.com", "198.51.100.7");
    expect(second.reused).toBe(true);
    expect(second.audit.id).toBe(first.audit.id);
  });

  it("is idempotent when the same audit is processed concurrently", async () => {
    const { audit } = await requestAudit("acmeplumbing-tampa.com", "203.0.113.9");
    await processAudit(audit.id);
    await Promise.all([processAudit(audit.id), processAudit(audit.id)]);
    expect(vi.mocked(runAudit)).toHaveBeenCalledTimes(1);
  });

  it("rate-limits audits per visitor", async () => {
    for (let i = 0; i < FREE_LIMITS.auditsPerIpPerHour; i++) await requestAudit(`site-${i}-example.com`, "203.0.113.50");
    await expect(requestAudit("one-more-example.com", "203.0.113.50")).rejects.toBeInstanceOf(RateLimitError);
    // A different visitor is unaffected.
    await expect(requestAudit("one-more-example.com", "203.0.113.51")).resolves.toMatchObject({ reused: false });
  });

  it("rejects invalid and internal addresses before storing anything", async () => {
    await expect(requestAudit("http://169.254.169.254/", "203.0.113.9")).rejects.toBeInstanceOf(AuditError);
    await expect(requestAudit("not a url", "203.0.113.9")).rejects.toBeInstanceOf(AuditError);
    expect(await getStore().countSince("2000-01-01T00:00:00.000Z")).toBe(0);
  });

  it("records a clear failure when the site cannot be audited", async () => {
    vi.mocked(runAudit).mockRejectedValueOnce(new AuditError("UNREACHABLE", "We couldn't connect to that website."));
    const { audit } = await requestAudit("down-example.com", "203.0.113.9");
    await processAudit(audit.id);
    const saved = await getStore().getAudit(audit.id);
    expect(saved).toMatchObject({ status: "failed", error: { code: "UNREACHABLE" } });
    // A failed audit does not block a retry.
    expect((await requestAudit("down-example.com", "203.0.113.9")).reused).toBe(false);
  });

  it("hides internal error details from visitors", async () => {
    vi.mocked(runAudit).mockRejectedValueOnce(new Error("secret stack detail"));
    const { audit } = await requestAudit("crash-example.com", "203.0.113.9");
    await processAudit(audit.id);
    const view = toPublicAudit((await getStore().getAudit(audit.id))!);
    expect(view.error?.code).toBe("INTERNAL");
    expect(JSON.stringify(view)).not.toContain("secret");
  });

  it("reports a stalled audit as failed rather than spinning forever", async () => {
    const { audit } = await requestAudit("acmeplumbing-tampa.com", "203.0.113.9");
    const old = { ...audit, updatedAt: new Date(Date.now() - FREE_LIMITS.staleAfterMs - 1000).toISOString() };
    expect(isStale(old)).toBe(true);
    expect(toPublicAudit(old)).toMatchObject({ status: "failed", error: { code: "TIMEOUT" } });
    expect(isStale(audit)).toBe(false);
  });

  it("surfaces database failures instead of pretending the audit was saved", async () => {
    const broken = new Proxy({} as AuditStore, { get: () => async () => { throw new Error("db down"); } });
    setStore(broken);
    await expect(requestAudit("acmeplumbing-tampa.com", "203.0.113.9")).rejects.toThrow("db down");
  });

  it("refuses to run on Vercel without database credentials", () => {
    setStore(null);
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    expect(() => getStore()).toThrow(StoreNotConfiguredError);
  });

  it("hashes IP addresses with a salt", () => {
    expect(hashIp("203.0.113.9")).toMatch(/^[0-9a-f]{32}$/);
    expect(hashIp("203.0.113.9")).toBe(hashIp("203.0.113.9"));
    expect(hashIp("203.0.113.9")).not.toBe(hashIp("203.0.113.10"));
  });

  it("stores report requests", async () => {
    const { audit } = await requestAudit("acmeplumbing-tampa.com", "203.0.113.9");
    await expect(getStore().saveLead({ auditId: audit.id, email: "owner@acmeplumbing-tampa.com", name: null, ipHash: "x" })).resolves.toBeUndefined();
  });
});
