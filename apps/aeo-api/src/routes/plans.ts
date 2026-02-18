import { z } from "zod";
import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { extractServicesAndEntities } from "../pipeline/extract.js";
import { generateActionPlan } from "../pipeline/plan.js";
import type { AeoStore } from "../storage/store.js";

const generatePlanInputSchema = z.object({
  siteId: z.string().min(1),
});

export const plansRoutes = (store: AeoStore): FastifyPluginAsync => {
  const plugin: FastifyPluginAsync = async (app) => {
    const generateHandler = async (
      request: FastifyRequest,
      reply: FastifyReply,
      enforceSubscription: boolean,
    ) => {
      const inputResult = generatePlanInputSchema.safeParse(request.body);
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

      const latestAudit = await store.getLatestAudit(site.id);
      if (!latestAudit) {
        return reply.status(404).send({ error: "AUDIT_NOT_FOUND" });
      }

      const documents = await store.listDocumentsBySiteId(site.id);
      const extractedEntities = Array.from(
        new Set(
          documents.flatMap((document) => {
            const source = [document.title, ...document.h1, ...document.h2, document.body]
              .filter(Boolean)
              .join("\n");
            return extractServicesAndEntities(source).entities;
          }),
        ),
      );

      const plan = generateActionPlan({
        site,
        latestAudit,
        extractedEntities,
        topQueries: latestAudit.topWinningQueries,
      });
      const savedPlan = await store.saveActionPlan(plan);
      return reply.status(201).send({ data: savedPlan });
    };

    app.post("/v1/plans/generate", async (request, reply) =>
      generateHandler(request, reply, true),
    );

    app.get<{ Params: { siteId: string } }>("/v1/plans/:siteId", async (request, reply) => {
      const plan = await store.getLatestActionPlan(request.params.siteId);
      if (!plan) {
        return reply.status(404).send({ error: "PLAN_NOT_FOUND" });
      }
      return { data: plan };
    });
  };

  return plugin;
};
