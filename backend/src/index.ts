import server from "./server.js";
import { PORT } from "./config/envs.js";
import { redisClient } from "./config/redis.js";

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error("Failed to connect to Redis:", err);
    process.exit(1);
  });

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
