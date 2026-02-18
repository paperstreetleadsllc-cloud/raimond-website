import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createMonitoringScheduler } from "../scheduler.js";
import { createFileStore } from "../../storage/store.js";

class FakeClock {
  private index = 0;

  constructor(private readonly isoValues: string[]) {}

  now(): Date {
    const value = this.isoValues[Math.min(this.index, this.isoValues.length - 1)];
    this.index += 1;
    return new Date(value);
  }
}

const tempDirs: string[] = [];

const createTempDataDir = async (): Promise<string> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "aeo-scheduler-test-"));
  tempDirs.push(dir);
  return dir;
};

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("monitoring scheduler", () => {
  it("uses injected clock and writes history/alerts for subscribed site", async () => {
    const dataDir = await createTempDataDir();
    const store = createFileStore({ dataDir });
    await store.init();

    const site = await store.createSite({
      url: "https://subscribed.example",
      ownerEmail: "ops@example.com",
    });
    await store.upsertBillingCustomer({
      email: "ops@example.com",
      customerId: "cus_123",
      status: "active",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    await store.saveRunHistory({
      id: "hist_seed",
      siteId: site.id,
      runType: "audit",
      timestamp: "2026-02-01T00:00:00.000Z",
      score: 95,
      pagesIndexed: 4,
      topWinningQueries: ["best term life insurance"],
      weakAreas: [],
    });

    const clock = new FakeClock([
      "2026-03-01T00:00:00.000Z",
      "2026-03-01T00:01:00.000Z",
      "2026-03-01T00:02:00.000Z",
      "2026-03-01T00:03:00.000Z",
      "2026-03-01T00:04:00.000Z",
      "2026-03-01T00:05:00.000Z",
    ]);

    const scheduler = createMonitoringScheduler({
      store,
      clock,
      nightlySiteLimit: 5,
      weeklySiteLimit: 5,
      crawlRunner: async () => ({
        pagesDiscovered: 0,
        pagesIndexed: 0,
        skippedNoindex: 0,
        pages: [],
      }),
    });

    const nightlyCount = await scheduler.runNightlyCrawlRefresh();
    const weeklyCount = await scheduler.runWeeklyAuditSweep();

    expect(nightlyCount).toBe(1);
    expect(weeklyCount).toBe(1);

    const history = await store.listSiteHistory(site.id);
    expect(history.some((entry) => entry.runType === "crawl")).toBe(true);
    expect(history.some((entry) => entry.runType === "audit")).toBe(true);
    expect(history[history.length - 1]?.timestamp).toMatch(/^2026-03-01T/);

    const alerts = await store.listAlerts(site.id);
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some((alert) => alert.rule === "score_drop_week_over_week")).toBe(true);
  });
});
