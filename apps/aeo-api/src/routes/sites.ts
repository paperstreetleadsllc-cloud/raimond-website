import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { CreateSiteInputSchema } from "../domain/types.js";
import type { AeoStore } from "../storage/store.js";

export const sitesRoutes = (store: AeoStore): FastifyPluginAsync => {
  const plugin: FastifyPluginAsync = async (app) => {
    const createSiteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
      const inputResult = CreateSiteInputSchema.safeParse(request.body);
      if (!inputResult.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: inputResult.error.flatten(),
        });
      }

      const site = await store.createSite(inputResult.data);
      return reply.status(201).send({ data: site });
    };

    const listSitesHandler = async () => {
      const sites = await store.listSites();
      return { data: sites };
    };

    const historyHandler = async (
      request: FastifyRequest<{ Params: { siteId: string } }>,
      reply: FastifyReply,
    ) => {
      const site = await store.getSiteById(request.params.siteId);
      if (!site) {
        return reply.status(404).send({ error: "SITE_NOT_FOUND" });
      }
      const history = await store.listSiteHistory(site.id);
      return { data: history };
    };

    app.post("/sites", createSiteHandler);
    app.post("/v1/sites", createSiteHandler);

    app.get("/sites", listSitesHandler);
    app.get("/v1/sites", listSitesHandler);

    app.get<{ Params: { siteId: string } }>("/sites/:siteId/history", historyHandler);
    app.get<{ Params: { siteId: string } }>("/v1/sites/:siteId/history", historyHandler);
  };

  return plugin;
};
