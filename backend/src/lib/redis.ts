import Redis from "ioredis";
import { logger } from "./logger";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  logger.info("🔌 Redis: Connection established...");
});

redis.on("ready", () => {
  logger.info("✅ Redis: Ready!");
});

redis.on("error", (err: Error) => {
  logger.error(err, "❌ Redis connection error");
});

export default redis;
