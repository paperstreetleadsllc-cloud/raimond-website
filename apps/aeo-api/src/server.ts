import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyServerOptions } from "fastify";
import cors from "@fastify/cors";
import { config } from "./lib/config.js";
import { createMonitoringScheduler } from "./jobs/scheduler.js";
import { loggerConfig } from "./lib/logger.js";
import type { CrawlSiteResult } from "./pipeline/crawl.js";
import { answersRoutes } from "./routes/answers.js";
import { alertsRoutes } from "./routes/alerts.js";
import { auditsRoutes } from "./routes/audits.js";
import { billingRoutes } from "./routes/billing.js";
import { crawlRoutes } from "./routes/crawl.js";
import { healthRoutes } from "./routes/health.js";
import { plansRoutes } from "./routes/plans.js";
import { sitesRoutes } from "./routes/sites.js";
import { createFileStore, type FileStoreOptions } from "./storage/store.js";

const productionWebOrigin = "https://app.paperstreetleads.com";

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) {
    // Allow non-browser clients like curl and server-to-server calls.
    return true;
  }

  if (origin === productionWebOrigin) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const isLocalHttp = parsedOrigin.protocol === "http:";
    const isLocalHost =
      parsedOrigin.hostname === "localhost" || parsedOrigin.hostname === "127.0.0.1";
    return isLocalHttp && isLocalHost;
  } catch {
    return false;
  }
};

export const buildServer = async (
  storeOptions: FileStoreOptions = {},
  withLogger: FastifyServerOptions["logger"] = loggerConfig,
  crawlRunner?: (startUrl: string) => Promise<CrawlSiteResult>,
  enableScheduler = false,
) => {
  const store = createFileStore(storeOptions);
  await store.init();

  const server = Fastify({
    logger: withLogger,
  });

  await server.register(cors, {
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  });

  await server.register(healthRoutes);
  await server.register(sitesRoutes(store));
  await server.register(auditsRoutes(store, crawlRunner));
  await server.register(crawlRoutes(store, crawlRunner));
  await server.register(alertsRoutes(store));
  await server.register(plansRoutes(store));
  await server.register(billingRoutes(store));
  await server.register(answersRoutes);

  if (enableScheduler) {
    const scheduler = createMonitoringScheduler({
      store,
      crawlRunner,
    });
    scheduler.start();
    server.addHook("onClose", async () => {
      scheduler.stop();
    });
  }

  return server;
};

const start = async (): Promise<void> => {
  try {
    const server = await buildServer({}, loggerConfig, undefined, true);
    await server.listen({
      host: config.host,
      port: config.port,
    });

    server.log.info(
      `AEO API listening on http://${config.host}:${config.port}`,
    );
  } catch (error) {
    // Log startup failures before Fastify is guaranteed to be available.
    console.error("Failed to start AEO API", error);
    process.exit(1);
  }
};

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await start();
}
