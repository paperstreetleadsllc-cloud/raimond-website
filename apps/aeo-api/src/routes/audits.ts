import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { crawlSite, type CrawlSiteResult } from "../pipeline/crawl.js";
import { RunAuditInputSchema } from "../domain/types.js";
import { createMonitoringService } from "../pipeline/monitoring.js";
import type { AeoStore } from "../storage/store.js";

export const auditsRoutes = (
  store: AeoStore,
  crawlRunner: (startUrl: string) => Promise<CrawlSiteResult> = (startUrl) =>
    crawlSite({ startUrl, maxDepth: 2, maxPages: 50, concurrency: 4 }),
): FastifyPluginAsync => {
  const plugin: FastifyPluginAsync = async (app) => {
    const monitoring = createMonitoringService({
      store,
      crawlRunner,
    });

    const runAuditHandler = async (
      request: FastifyRequest,
      reply: FastifyReply,
      enforceSubscription: boolean,
    ) => {
      const inputResult = RunAuditInputSchema.safeParse(request.body);
      if (!inputResult.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: inputResult.error.flatten(),
        });
      }

      const site = await store.getSiteById(inputResult.data.siteId);
      if (!site) {
        return reply.status(404).send({ error: "SITE_NOT_FOUND" });
      }

      if (enforceSubscription) {
        const ownerEmail = site.ownerEmail?.trim().toLowerCase();
        const billing = ownerEmail ? await store.getBillingCustomerByEmail(ownerEmail) : null;
        if (billing?.status !== "active" && billing?.status !== "trialing") {
          return reply.status(402).send({ error: "SUBSCRIPTION_REQUIRED" });
        }
      }

      const savedAudit = await monitoring.runWeeklyAudit(site);
      return reply.status(201).send({ data: savedAudit });
    };

    app.post("/audits/run", async (request, reply) => runAuditHandler(request, reply, false));
    app.post("/v1/audits/run", async (request, reply) => runAuditHandler(request, reply, true));

    const getAuditHandler = async (
      request: FastifyRequest<{ Params: { siteId: string } }>,
      reply: FastifyReply,
    ) => {
      const audit = await store.getLatestAudit(request.params.siteId);
      if (!audit) {
        return reply.status(404).send({ error: "AUDIT_NOT_FOUND" });
      }
      return { data: audit };
    };

    app.get<{ Params: { siteId: string } }>("/audits/:siteId", getAuditHandler);
    app.get<{ Params: { siteId: string } }>("/v1/audits/:siteId", getAuditHandler);
  };

  return plugin;
};
