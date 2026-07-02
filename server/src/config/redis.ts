/**
 * Node Imports
 */
import IORedis from "ioredis";

/**
 * Other Imports
 */
import { env } from "./env";

export const ioRedisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy: (times: number) => {
    if (times > 5) return null;
    return Math.min(times * 500, 3000);
  },
});

ioRedisConnection.on("connect", () =>
  console.log(`IORedis connected to Upstash`),
);
ioRedisConnection.on("error", (err) =>
  console.error(`IORedis error`, err.message),
);