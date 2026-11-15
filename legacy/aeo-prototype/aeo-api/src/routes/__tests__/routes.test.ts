import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CrawlSiteResult } from "../../pipeline/crawl.js";
import { buildServer } from "../../server.js";

let dataDir: string;
let server: FastifyInstance;

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(os.tmpdir(), "aeo-routes-test-"));
  await writeFile(
    path.join(dataDir, "billing-customers.json"),
    JSON.stringify(
      [
        {
          email: "subscribed@example.com",
          customerId: "cus_test_subscribed",
          status: "active",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
      null,
      2,
    ),
    "utf8",
  );
  const crawlRunner = async (): Promise<CrawlSiteResult> => ({
    pagesDiscovered: 2,
    pagesIndexed: 2,
    skippedNoindex: 0,
    pages: [
      {
        url: "https://newsite.example",
        title: "Home",
        metaDescription: "Home page",
        h1: ["Home"],
        h2: ["Products"],
        mainText: "Paragraph one.\n\nParagraph two.",
        paragraphs: ["Paragraph one.", "Paragraph two."],
        faqs: [],
        services: ["insurance"],
        entities: ["Newsite Insurance"],
        noindex: false,
        internalLinks: ["https://newsite.example/products"],
      },
      {
        url: "https://newsite.example/products",
        title: "Products",
        h1: ["Products"],
        h2: [],
        mainText: "Products page content.",
        paragraphs: ["Products page content."],
        faqs: [],
        services: ["coverage"],
        entities: ["Newsite Insurance"],
        noindex: false,
        internalLinks: [],
      },
    ],
  });
  server = await buildServer({ dataDir }, false, crawlRunner);
});

afterEach(async () => {
  await server.close();
  await rm(dataDir, { recursive: true, force: true });
});

describe("AEO API routes", () => {
  it("creates and lists sites", async () => {
    const createResponse = await server.inject({
      method: "POST",
      url: "/sites",
      payload: {
        url: "https://newsite.example",
        businessName: "New Site",
        vertical: "insurance",
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const createBody = createResponse.json<{ data: { id: string; url: string } }>();
    expect(createBody.data.id).toMatch(/^site_[a-f0-9]{16}$/);
    expect(createBody.data.url).toBe("https://newsite.example");

    const listResponse = await server.inject({
      method: "GET",
      url: "/sites",
    });

    expect(listResponse.statusCode).toBe(200);
    const listBody = listResponse.json<{ data: Array<{ id: string }> }>();
    expect(listBody.data.length).toBeGreaterThanOrEqual(2);
    expect(listBody.data.some((item) => item.id === createBody.data.id)).toBe(true);
  });

  it("runs audit and returns latest audit by site", async () => {
    const siteCreateResponse = await server.inject({
      method: "POST",
      url: "/v1/sites",
      payload: { url: "https://audit-target.example" },
    });
    const siteId = siteCreateResponse.json<{ data: { id: string } }>().data.id;

    const runAuditResponse = await server.inject({
      method: "POST",
      url: "/audits/run",
      payload: { siteId },
    });

    expect(runAuditResponse.statusCode).toBe(201);
    const runAuditBody = runAuditResponse.json<{
      data: { id: string; siteId: string; totalScore: number; topWinningQueries: string[] };
    }>();
    expect(runAuditBody.data.id).toMatch(/^audit_[a-f0-9]{16}$/);
    expect(runAuditBody.data.siteId).toBe(siteId);
    expect(runAuditBody.data.totalScore).toBeGreaterThanOrEqual(0);
    expect(runAuditBody.data.totalScore).toBeLessThanOrEqual(100);
    expect(runAuditBody.data.topWinningQueries.length).toBeGreaterThan(0);

    const latestResponse = await server.inject({
      method: "GET",
      url: `/v1/audits/${siteId}`,
    });

    expect(latestResponse.statusCode).toBe(200);
    const latestBody = latestResponse.json<{ data: { id: string } }>();
    expect(latestBody.data.id).toBe(runAuditBody.data.id);
  });

  it("returns validation and not-found errors consistently", async () => {
    const invalidCreate = await server.inject({
      method: "POST",
      url: "/sites",
      payload: { url: "not-a-url" },
    });
    expect(invalidCreate.statusCode).toBe(400);

    const missingSiteAudit = await server.inject({
      method: "POST",
      url: "/v1/audits/run",
      payload: { siteId: "site_missing" },
    });
    expect(missingSiteAudit.statusCode).toBe(404);

    const missingAudit = await server.inject({
      method: "GET",
      url: "/v1/audits/site_missing",
    });
    expect(missingAudit.statusCode).toBe(404);
  });

  it("runs crawl and stores documents/chunks", async () => {
    const siteCreateResponse = await server.inject({
      method: "POST",
      url: "/sites",
      payload: { url: "https://newsite.example" },
    });
    const siteId = siteCreateResponse.json<{ data: { id: string } }>().data.id;

    const crawlResponse = await server.inject({
      method: "POST",
      url: "/v1/crawl/run",
      payload: { siteId },
    });

    expect(crawlResponse.statusCode).toBe(201);
    const body = crawlResponse.json<{
      data: { crawlId: string; documentsStored: number; chunksStored: number };
    }>();
    expect(body.data.crawlId).toMatch(/^crawl_[a-f0-9]{16}$/);
    expect(body.data.documentsStored).toBe(2);
    expect(body.data.chunksStored).toBeGreaterThanOrEqual(2);
  });

  it("returns site run history and alerts", async () => {
    const siteCreateResponse = await server.inject({
      method: "POST",
      url: "/sites",
      payload: { url: "https://history-target.example", ownerEmail: "owner@example.com" },
    });
    const siteId = siteCreateResponse.json<{ data: { id: string } }>().data.id;

    const runAuditResponse = await server.inject({
      method: "POST",
      url: "/audits/run",
      payload: { siteId },
    });
    expect(runAuditResponse.statusCode).toBe(201);

    const historyResponse = await server.inject({
      method: "GET",
      url: `/sites/${siteId}/history`,
    });
    expect(historyResponse.statusCode).toBe(200);
    const historyBody = historyResponse.json<{ data: Array<{ runType: string }> }>();
    expect(historyBody.data.length).toBeGreaterThan(0);
    expect(historyBody.data.some((entry) => entry.runType === "audit")).toBe(true);

    const alertsResponse = await server.inject({
      method: "GET",
      url: `/v1/alerts?siteId=${siteId}`,
    });
    expect(alertsResponse.statusCode).toBe(200);
    const alertsBody = alertsResponse.json<{ data: Array<{ siteId: string }> }>();
    expect(alertsBody.data.every((entry) => entry.siteId === siteId)).toBe(true);
  });

  it("generates and fetches latest action plan", async () => {
    const siteCreateResponse = await server.inject({
      method: "POST",
      url: "/v1/sites",
      payload: {
        url: "https://plan-target.example",
        businessName: "Plan Target",
        ownerEmail: "subscribed@example.com",
      },
    });
    const siteId = siteCreateResponse.json<{ data: { id: string } }>().data.id;

    const runAuditResponse = await server.inject({
      method: "POST",
      url: "/v1/audits/run",
      payload: { siteId },
    });
    expect(runAuditResponse.statusCode).toBe(201);

    const generateResponse = await server.inject({
      method: "POST",
      url: "/v1/plans/generate",
      payload: { siteId },
    });
    expect(generateResponse.statusCode).toBe(201);
    const generated = generateResponse.json<{
      data: { id: string; siteId: string; items: Array<{ id: string; title: string }> };
    }>();
    expect(generated.data.id).toMatch(/^plan_[a-f0-9]{16}$/);
    expect(generated.data.siteId).toBe(siteId);
    expect(generated.data.items.length).toBeGreaterThanOrEqual(8);
    expect(generated.data.items.length).toBeLessThanOrEqual(20);

    const latestResponse = await server.inject({
      method: "GET",
      url: `/v1/plans/${siteId}`,
    });
    expect(latestResponse.statusCode).toBe(200);
    const latest = latestResponse.json<{ data: { id: string } }>();
    expect(latest.data.id).toBe(generated.data.id);
  });

  it("requires active subscription for v1 audit and plan generation", async () => {
    const siteCreateResponse = await server.inject({
      method: "POST",
      url: "/v1/sites",
      payload: {
        url: "https://needs-subscription.example",
        ownerEmail: "unsubscribed@example.com",
      },
    });
    const siteId = siteCreateResponse.json<{ data: { id: string } }>().data.id;

    const auditResponse = await server.inject({
      method: "POST",
      url: "/v1/audits/run",
      payload: { siteId },
    });
    expect(auditResponse.statusCode).toBe(402);
    expect(auditResponse.json<{ error: string }>().error).toBe("SUBSCRIPTION_REQUIRED");

    const planResponse = await server.inject({
      method: "POST",
      url: "/v1/plans/generate",
      payload: { siteId },
    });
    expect(planResponse.statusCode).toBe(402);
    expect(planResponse.json<{ error: string }>().error).toBe("SUBSCRIPTION_REQUIRED");
  });
});
