import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT as string) || 6379,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("🔴 Redis connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

export default redis;
