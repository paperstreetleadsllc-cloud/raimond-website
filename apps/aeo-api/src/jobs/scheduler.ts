import cron, { type ScheduledTask } from "node-cron";
import type { Site } from "../domain/types.js";
import type { AeoStore } from "../storage/store.js";
import { createMonitoringService, systemClock, type Clock } from "../pipeline/monitoring.js";
import type { CrawlSiteResult } from "../pipeline/crawl.js";

type SchedulerOptions = {
  store: AeoStore;
  crawlRunner?: (startUrl: string) => Promise<CrawlSiteResult>;
  clock?: Clock;
  nightlySiteLimit?: number;
  weeklySiteLimit?: number;
};

const runForSites = async (
  sites: Site[],
  runner: (site: Site) => Promise<unknown>,
): Promise<void> => {
  for (const site of sites) {
    await runner(site);
  }
};

export const createMonitoringScheduler = (options: SchedulerOptions) => {
  const store = options.store;
  const clock = options.clock ?? systemClock;
  const nightlySiteLimit = options.nightlySiteLimit ?? 25;
  const weeklySiteLimit = options.weeklySiteLimit ?? 50;
  const monitoring = createMonitoringService({
    store,
    crawlRunner: options.crawlRunner,
    clock,
  });

  let nightlyTask: ScheduledTask | null = null;
  let weeklyTask: ScheduledTask | null = null;

  const runNightlyCrawlRefresh = async (): Promise<number> => {
    const sites = await store.listActiveSubscribedSites(nightlySiteLimit);
    await runForSites(sites, monitoring.runCrawlRefresh);
    return sites.length;
  };

  const runWeeklyAuditSweep = async (): Promise<number> => {
    const sites = await store.listActiveSubscribedSites(weeklySiteLimit);
    await runForSites(sites, monitoring.runWeeklyAudit);
    return sites.length;
  };

  const start = (): void => {
    nightlyTask = cron.schedule("0 2 * * *", () => {
      void runNightlyCrawlRefresh();
    });
    weeklyTask = cron.schedule("0 3 * * 1", () => {
      void runWeeklyAuditSweep();
    });
  };

  const stop = (): void => {
    nightlyTask?.stop();
    weeklyTask?.stop();
    nightlyTask = null;
    weeklyTask = null;
  };

  return {
    start,
    stop,
    runNightlyCrawlRefresh,
    runWeeklyAuditSweep,
  };
};
