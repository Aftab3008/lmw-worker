import { Worker, Queue } from "bullmq";
import dotenv from "dotenv";
import { sendOtpEmail } from "./services/email.services.js";
import { redisQueue } from "./config/redis.js";

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

const worker = new Worker(
  "service",
  async (job) => {
    if (job.name === "send-otp") {
      const { email, otp } = job.data;
      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }
      await sendOtpEmail({
        email,
        otp,
      });
    }
  },
  {
    connection: {
      url: redisURL,
      password: isProduction ? redisPassword : undefined,
    },
  }
);
worker.on("completed", (job) => {
  console.log(`Job ${job.id}:${job.name} completed successfully`);
});

worker.on("failed", async (job, err) => {
  console.error(`Job ${job?.id}:${job?.name} failed with error:`, err);

  if (job) {
    const maxRetries = 3; // Maximum number of retries
    const currentRetries = (job.data.retryCount || 0) + 1;

    if (currentRetries <= maxRetries) {
      console.log(
        `Retrying job ${job.id}:${job.name} (attempt ${currentRetries}/${maxRetries})`
      );

      // Add the job back to the queue with incremented retry count
      await redisQueue.add(
        job.name,
        { ...job.data, retryCount: currentRetries },
        {
          delay: Math.pow(2, currentRetries) * 1000, // Exponential backoff: 2s, 4s, 8s
          removeOnComplete: 10,
          removeOnFail: 5,
        }
      );
    } else {
      console.error(
        `Job ${job.id}:${job.name} has exceeded maximum retry attempts (${maxRetries})`
      );
    }
  }
});

worker.on("error", (err) => {
  console.error("Worker encountered an error:", err);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, shutting down gracefully...");
  await worker.close();
  await redisQueue.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  await worker.close();
  await redisQueue.close();
  process.exit(0);
});
