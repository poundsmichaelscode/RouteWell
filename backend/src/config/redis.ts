import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true
});

redis.on("error", (error) => logger.error("Redis error", { error }));

export async function connectRedis(): Promise<void> {
  if (redis.status === "wait") await redis.connect();
  logger.info("Redis connection established");
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
