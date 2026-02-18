import type { FastifyServerOptions } from "fastify";
import { config } from "./config.js";

export const loggerConfig: FastifyServerOptions["logger"] = {
  level: config.logLevel,
};
