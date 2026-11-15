import { chunkByParagraphs } from "./chunk.js";
import { crawlSite, type CrawlSiteResult } from "./crawl.js";
import { createSiteProfile, generateQueryUniverse } from "./query-universe.js";
import { simulateAeoVisibility } from "./simulate.js";
import { ConsoleEmailNotifier, type NotificationService } from "../notifications/notifier.js";
import {
  AuditResultSchema,
  CrawlResultSchema,
  DocumentSchema,
  type AlertRecord,
  type AuditResult,
  type Chunk,
  type CrawlResult,
  type Document,
  type RunHistoryEntry,
  type Site,
} from "../domain/types.js";
import { buildStableId, type AeoStore } from "../storage/store.js";

export type Clock = {
  now(): Date;
};

export const systemClock: Clock = {
  now: () => new Date(),
};

const defaultCrawlRunner = (startUrl: string): Promise<CrawlSiteResult> =>
  crawlSite({ startUrl, maxDepth: 2, maxPages: 50, concurrency: 4 });

type CrawlArtifacts = {
  crawl: CrawlResult;
  documents: Document[];
  chunks: Chunk[];
  crawlOutput: CrawlSiteResult;
};

export const createMonitoringService = (dependencies: {
  store: AeoStore;
  crawlRunner?: (startUrl: string) => Promise<CrawlSiteResult>;
  clock?: Clock;
  notifier?: NotificationService;
}) => {
  const store = dependencies.store;
  const crawlRunner = dependencies.crawlRunner ?? defaultCrawlRunner;
  const clock = dependencies.clock ?? systemClock;
  const notifier = dependencies.notifier ?? new ConsoleEmailNotifier();

  const buildCrawlArtifacts = async (site: Site): Promise<CrawlArtifacts> => {
    const startedAt = clock.now().toISOString();
    const crawlOutput = await crawlRunner(site.url);
    const completedAt = clock.now().toISOString();

    const crawl: CrawlResult = CrawlResultSchema.parse({
      id: buildStableId("crawl", `${site.url}|${startedAt}`),
      siteId: site.id,
      startUrl: site.url,
      status: "completed",
      startedAt,
      completedAt,
      pagesDiscovered: crawlOutput.pagesDiscovered,
      pagesIndexed: crawlOutput.pagesIndexed,
      notes:
        crawlOutput.skippedNoindex > 0
          ? [`Skipped ${crawlOutput.skippedNoindex} noindex pages`]
          : [],
    });

    const documents: Document[] = crawlOutput.pages.map((page) =>
      DocumentSchema.parse({
        id: buildStableId("doc", `${page.url}|${startedAt}`),
        siteId: site.id,
        sourceUrl: page.url,
        title: page.title,
        metaDescription: page.metaDescription,
        h1: page.h1,
        h2: page.h2,
        body: page.mainText,
        createdAt: startedAt,
      }),
    );

    const chunks: Chunk[] = documents.flatMap((document) => {
      const page = crawlOutput.pages.find((item) => item.url === document.sourceUrl);
      if (!page) {
        return [];
      }
      return chunkByParagraphs(
        {
          documentId: document.id,
          siteId: site.id,
          sourceUrl: page.url,
          heading: page.h1[0] ?? page.h2[0],
          text: page.mainText,
          createdAt: startedAt,
        },
        1200,
      );
    });

    return {
      crawl,
      documents,
      chunks,
      crawlOutput,
    };
  };

  const runCrawlRefresh = async (site: Site): Promise<CrawlArtifacts> => {
    const artifacts = await buildCrawlArtifacts(site);
    await store.saveCrawlArtifacts({
      crawl: artifacts.crawl,
      documents: artifacts.documents,
      chunks: artifacts.chunks,
    });

    const historyEntry: RunHistoryEntry = {
      id: buildStableId("hist", `${site.id}|crawl|${clock.now().toISOString()}`),
      siteId: site.id,
      runType: "crawl",
      timestamp: clock.now().toISOString(),
      pagesIndexed: artifacts.crawl.pagesIndexed,
      topWinningQueries: [],
      weakAreas: [],
    };
    await store.saveRunHistory(historyEntry);

    return artifacts;
  };

  const evaluateAlerts = async (site: Site, audit: AuditResult): Promise<AlertRecord[]> => {
    const history = await store.listSiteHistory(site.id);
    const priorAudits = history
      .filter((entry) => entry.runType === "audit" && typeof entry.score === "number")
      .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));

    const previous = [...priorAudits]
      .filter((entry) => entry.timestamp !== audit.createdAt)
      .pop();
    const alerts: AlertRecord[] = [];
    const nowIso = clock.now().toISOString();

    if (previous?.score !== undefined && previous.score - audit.totalScore > 10) {
      alerts.push({
        id: buildStableId("alert", `${site.id}|score-drop|${nowIso}`),
        siteId: site.id,
        rule: "score_drop_week_over_week",
        message: `Visibility score dropped ${previous.score - audit.totalScore} points week-over-week.`,
        createdAt: nowIso,
        metadata: {
          previousScore: previous.score,
          currentScore: audit.totalScore,
        },
      });
    }

    const prevQueries = new Set(previous?.topWinningQueries ?? []);
    const lostWinners = [...prevQueries].filter((query) => !audit.topWinningQueries.includes(query));
    if (lostWinners.length > 0) {
      alerts.push({
        id: buildStableId("alert", `${site.id}|query-loss|${nowIso}`),
        siteId: site.id,
        rule: "top_query_winners_lost",
        message: `Top query winners lost: ${lostWinners.slice(0, 3).join(", ")}.`,
        createdAt: nowIso,
        metadata: {
          lostCount: lostWinners.length,
          lostQueries: lostWinners,
        },
      });
    }

    if (audit.weakAreas.length > 0) {
      alerts.push({
        id: buildStableId("alert", `${site.id}|coverage-gap|${nowIso}`),
        siteId: site.id,
        rule: "coverage_gaps_detected",
        message: `Coverage gaps detected in: ${audit.weakAreas.join(", ")}.`,
        createdAt: nowIso,
        metadata: {
          weakAreas: audit.weakAreas,
        },
      });
    }

    if (alerts.length > 0) {
      await store.saveAlerts(alerts);
      await Promise.all(alerts.map((alert) => notifier.notifyAlert(alert)));
    }

    return alerts;
  };

  const runWeeklyAudit = async (site: Site): Promise<AuditResult> => {
    const crawlArtifacts = await runCrawlRefresh(site);

    const profile = createSiteProfile({
      businessName: site.businessName,
      vertical: site.vertical,
      services: crawlArtifacts.crawlOutput.pages.flatMap((page) => page.services),
      entities: crawlArtifacts.crawlOutput.pages.flatMap((page) => page.entities),
      faqQuestions: crawlArtifacts.crawlOutput.pages.flatMap((page) =>
        page.faqs.map((faq) => faq.question),
      ),
      headings: crawlArtifacts.crawlOutput.pages.flatMap((page) => [...page.h1, ...page.h2]),
      pageCount: crawlArtifacts.documents.length,
      chunkCount: crawlArtifacts.chunks.length,
    });
    const queries = generateQueryUniverse(profile);
    const simulation = simulateAeoVisibility({
      queries,
      chunks: crawlArtifacts.chunks.map((chunk) => ({
        id: chunk.id,
        sourceUrl: chunk.sourceUrl,
        heading: chunk.heading,
        content: chunk.content,
        createdAt: chunk.createdAt,
      })),
      nowIso: clock.now().toISOString(),
    });

    const audit = AuditResultSchema.parse({
      id: buildStableId("audit", `${site.id}|${clock.now().toISOString()}`),
      siteId: site.id,
      score: simulation.totalScore,
      totalScore: simulation.totalScore,
      status: "completed",
      findings: simulation.findings,
      topWinningQueries: simulation.topWinningQueries,
      weakAreas: simulation.weakAreas,
      competitorGap: simulation.competitorGap,
      recommendedActions: simulation.recommendedActions,
      createdAt: clock.now().toISOString(),
    });

    const saved = await store.saveAudit(audit);
    await store.saveRunHistory({
      id: buildStableId("hist", `${site.id}|audit|${saved.createdAt}`),
      siteId: site.id,
      runType: "audit",
      timestamp: saved.createdAt,
      score: saved.totalScore,
      pagesIndexed: crawlArtifacts.crawl.pagesIndexed,
      topWinningQueries: saved.topWinningQueries,
      weakAreas: saved.weakAreas,
    });
    await evaluateAlerts(site, saved);
    return saved;
  };

  return {
    runCrawlRefresh,
    runWeeklyAudit,
    evaluateAlerts,
  };
};
