import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { crawlSite, type CrawlSiteResult } from "../pipeline/crawl.js";
import { RunCrawlInputSchema } from "../domain/types.js";
import { createMonitoringService } from "../pipeline/monitoring.js";
import type { AeoStore } from "../storage/store.js";

const crawlInputSchema = RunCrawlInputSchema;

export const crawlRoutes = (
  store: AeoStore,
  crawlRunner: (startUrl: string) => Promise<CrawlSiteResult> = (startUrl) =>
    crawlSite({ startUrl, maxDepth: 2, maxPages: 50, concurrency: 4 }),
): FastifyPluginAsync => {
  const plugin: FastifyPluginAsync = async (app) => {
    const monitoring = createMonitoringService({
      store,
      crawlRunner,
    });

    const runCrawlHandler = async (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => {
      const parsedInput = crawlInputSchema.safeParse(request.body);
      if (!parsedInput.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: parsedInput.error.flatten(),
        });
      }

      const site = await store.getSiteById(parsedInput.data.siteId);
      if (!site) {
        return reply.status(404).send({ error: "SITE_NOT_FOUND" });
      }

      const artifacts = await monitoring.runCrawlRefresh(site);

      return reply.status(201).send({
        data: {
          crawlId: artifacts.crawl.id,
          siteId: site.id,
          pagesDiscovered: artifacts.crawl.pagesDiscovered,
          pagesIndexed: artifacts.crawl.pagesIndexed,
          documentsStored: artifacts.documents.length,
          chunksStored: artifacts.chunks.length,
          startedAt: artifacts.crawl.startedAt,
          completedAt: artifacts.crawl.completedAt,
        },
      });
    };

    app.post("/crawl/run", runCrawlHandler);
    app.post("/v1/crawl/run", runCrawlHandler);
  };

  return plugin;
};
