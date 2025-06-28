import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const redisURL = process.env.REDIS_URL;
const redisPassword = process.env.REDIS_PASSWORD;
const isProduction = process.env.NODE_ENV === "production";

if (!redisURL) {
  throw new Error("REDIS_URL is not defined");
}

if (isProduction && !redisPassword) {
  throw new Error("REDIS_PASSWORD is required in production");
}

const queue = new Queue("service", {
  connection: {
    url: redisURL,
    password: isProduction ? redisPassword : undefined,
  },
});

export { queue as redisQueue };
