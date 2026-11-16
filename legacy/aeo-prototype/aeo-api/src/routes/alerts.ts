import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import type { AeoStore } from "../storage/store.js";

const querySchema = z.object({
  siteId: z.string().min(1).optional(),
});

export const alertsRoutes = (store: AeoStore): FastifyPluginAsync => {
  const plugin: FastifyPluginAsync = async (app) => {
    const listAlertsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = querySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          details: parsed.error.flatten(),
        });
      }

      const alerts = await store.listAlerts(parsed.data.siteId);
      return { data: alerts };
    };

    app.get("/alerts", listAlertsHandler);
    app.get("/v1/alerts", listAlertsHandler);
  };
  return plugin;
};
