import Redis from "ioredis";

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
  console.log("🔌 Redis: Connection established...");
});

redis.on("ready", () => {
  console.log("✅ Redis: Ready!");
});

redis.on("error", (err: Error) => {
  console.error("❌ Redis connection error:", err.message);
});

export default redis;
