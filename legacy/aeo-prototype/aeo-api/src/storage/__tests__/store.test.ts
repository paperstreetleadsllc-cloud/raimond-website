import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildStableId, createFileStore } from "../store.js";

const tempDirs: string[] = [];

const createTempDataDir = async (): Promise<string> => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "aeo-store-test-"));
  tempDirs.push(dir);
  return dir;
};

afterEach(async () => {
  await Promise.all(
    tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
  );
});

describe("FileStore", () => {
  it("creates data files and seeds sample data", async () => {
    const dataDir = await createTempDataDir();
    const store = createFileStore({ dataDir });

    await store.init();
    const sites = await store.listSites();

    expect(sites.length).toBeGreaterThan(0);
    expect(sites[0]?.id).toMatch(/^site_[a-f0-9]{16}$/);
  });

  it("creates deterministic site IDs based on URL and timestamp", async () => {
    const dataDir = await createTempDataDir();
    const store = createFileStore({ dataDir });
    await store.init();

    const site = await store.createSite({
      url: "https://acme-insurance.com",
      businessName: "Acme Insurance",
      vertical: "insurance",
    });

    expect(site.id).toBe(buildStableId("site", `${site.url}|${site.createdAt}`));
  });

  it("saves and fetches latest audit for a site", async () => {
    const dataDir = await createTempDataDir();
    const store = createFileStore({ dataDir });
    await store.init();

    const site = await store.createSite({ url: "https://auditable.example" });
    const timestamp = "2026-02-17T00:00:00.000Z";
    const audit = await store.saveAudit({
      id: buildStableId("audit", `${site.id}|${timestamp}`),
      siteId: site.id,
      score: 74,
      totalScore: 74,
      status: "completed",
      findings: ["Strong service intent coverage."],
      topWinningQueries: ["life insurance quote"],
      weakAreas: ["comparison"],
      competitorGap: "Competitor benchmark not connected yet.",
      recommendedActions: ["Add comparison-focused landing pages."],
      createdAt: timestamp,
    });
    const latest = await store.getLatestAudit(site.id);

    expect(audit.id).toBe(buildStableId("audit", `${site.id}|${timestamp}`));
    expect(latest?.id).toBe(audit.id);
    expect(audit.totalScore).toBe(74);
  });

  it("persists crawl artifacts to JSON files", async () => {
    const dataDir = await createTempDataDir();
    const store = createFileStore({ dataDir });
    await store.init();

    const site = await store.createSite({ url: "https://crawlable.example" });
    const timestamp = "2026-02-17T00:00:00.000Z";

    await store.saveCrawlArtifacts({
      crawl: {
        id: buildStableId("crawl", `${site.url}|${timestamp}`),
        siteId: site.id,
        startUrl: site.url,
        status: "completed",
        startedAt: timestamp,
        completedAt: timestamp,
        pagesDiscovered: 1,
        pagesIndexed: 1,
        notes: [],
      },
      documents: [
        {
          id: buildStableId("doc", `${site.url}|${timestamp}`),
          siteId: site.id,
          sourceUrl: site.url,
          title: "Home",
          h1: ["Home"],
          h2: [],
          body: "Home body.",
          createdAt: timestamp,
        },
      ],
      chunks: [
        {
          id: buildStableId("chunk", `${site.url}|${timestamp}|0`),
          documentId: buildStableId("doc", `${site.url}|${timestamp}`),
          siteId: site.id,
          sourceUrl: site.url,
          index: 0,
          content: "Home body.",
          tokenCount: 2,
          createdAt: timestamp,
        },
      ],
    });

    const [crawlFile, documentsFile, chunksFile] = await Promise.all([
      readFile(path.join(dataDir, "crawl-results.json"), "utf8"),
      readFile(path.join(dataDir, "documents.json"), "utf8"),
      readFile(path.join(dataDir, "chunks.json"), "utf8"),
    ]);

    expect(JSON.parse(crawlFile).length).toBe(1);
    expect(JSON.parse(documentsFile).length).toBe(1);
    expect(JSON.parse(chunksFile).length).toBe(1);
  });

  it("saves and fetches latest action plan", async () => {
    const dataDir = await createTempDataDir();
    const store = createFileStore({ dataDir });
    await store.init();

    const site = await store.createSite({ url: "https://planable.example" });
    const timestamp = "2026-02-17T00:00:00.000Z";

    const saved = await store.saveActionPlan({
      id: buildStableId("plan", `${site.id}|${timestamp}`),
      siteId: site.id,
      createdAt: timestamp,
      summary: "Test plan summary.",
      items: [
        {
          id: buildStableId("planitem", `${site.id}|${timestamp}|1`),
          title: "Deploy FAQ schema",
          priority: "P0",
          category: "schema",
          estimatedImpact: "High",
          effort: "Medium",
          instructions: ["Publish FAQ content.", "Embed schema."],
          deliverables: [
            {
              type: "jsonld",
              label: "FAQ schema",
              json: {
                "@context": "https://schema.org",
                "@type": "FAQPage",
              },
            },
          ],
        },
      ],
    });

    const latest = await store.getLatestActionPlan(site.id);
    expect(saved.id).toBe(buildStableId("plan", `${site.id}|${timestamp}`));
    expect(latest?.id).toBe(saved.id);
    expect(latest?.items.length).toBe(1);
  });
});
