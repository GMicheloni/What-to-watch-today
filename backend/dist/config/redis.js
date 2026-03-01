import { createClient } from "redis";
export const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
//# sourceMappingURL=redis.js.map