import http from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectDatabase, disconnectDatabase } from "./config/prisma";
import { connectRedis, disconnectRedis } from "./config/redis";

async function main(): Promise<void> {
  await connectDatabase();
  await connectRedis();
  const server = http.createServer(createApp());
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  server.requestTimeout = 30_000;
  server.listen(env.PORT, "0.0.0.0", () => logger.info("RouteWell API listening", { port: env.PORT }));

  const shutdown = async (signal: string) => {
    logger.info("Graceful shutdown started", { signal });
    server.close(async () => {
      await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15_000).unref();
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (error) => logger.error("Unhandled rejection", { error }));
  process.on("uncaughtException", (error) => { logger.error("Uncaught exception", { error }); void shutdown("uncaughtException"); });
}

void main().catch((error) => { logger.error("Application startup failed", { error }); process.exit(1); });
