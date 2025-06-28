import { ConsumeMessage } from "amqplib";
import { getChannel, closeConnection } from "../config/rabbitmq.js";
import { sendOtpEmail, EmailResult } from "../services/email.services.js";
import {
  OtpJobPayload,
  WorkerConfig,
  ProcessingResult,
} from "../types/index.js";

const config: WorkerConfig = {
  queueName: process.env.RABBITMQ_QUEUE_NAME || "notifications",
  maxRetries: parseInt(process.env.MAX_RETRIES || "3", 10),
  baseDelayMs: parseInt(process.env.BASE_DELAY_MS || "1000", 10),
  prefetchCount: parseInt(process.env.PREFETCH_COUNT || "1", 10),
};

// Input validation function
function validateJobPayload(payload: unknown): OtpJobPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload: must be an object");
  }

  const data = payload as Record<string, unknown>;

  // Validate email
  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email is required and must be a string");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Invalid email format");
  }

  // Validate OTP
  if (!data.otp || typeof data.otp !== "string") {
    throw new Error("OTP is required and must be a string");
  }

  if (data.otp.length < 4 || data.otp.length > 10) {
    throw new Error("OTP must be between 4 and 10 characters");
  }

  // Validate retryCount if provided
  const retryCount = data.retryCount ? Number(data.retryCount) : 0;
  if (isNaN(retryCount) || retryCount < 0) {
    throw new Error("retryCount must be a non-negative number");
  }

  return {
    email: data.email.trim().toLowerCase(),
    otp: data.otp.trim(),
    retryCount,
    jobId:
      (data.jobId as string) ||
      `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: (data.timestamp as number) || Date.now(),
  };
}

// Calculate exponential backoff delay with jitter
function calculateBackoffDelay(retryCount: number): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, retryCount);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
  return Math.floor(exponentialDelay + jitter);
}

// Process individual job
async function processJob(msg: ConsumeMessage): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    // Parse and validate message
    const rawData = JSON.parse(msg.content.toString());
    const jobData = validateJobPayload(rawData);

    console.log(
      `[PROCESSING] Job ${jobData.jobId} for ${jobData.email} (attempt ${
        jobData.retryCount + 1
      })`
    );

    // Send OTP email
    const emailResult: EmailResult = await sendOtpEmail({
      email: jobData.email,
      otp: jobData.otp,
    });

    const processingTime = Date.now() - startTime;

    if (!emailResult.success) {
      throw emailResult.error || new Error("Email sending failed");
    }

    console.log(
      `[SUCCESS] Job ${jobData.jobId} completed in ${processingTime}ms`
    );

    return {
      success: true,
      processingTimeMs: processingTime,
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const jobError = error instanceof Error ? error : new Error(String(error));

    console.error(
      `[ERROR] Job failed in ${processingTime}ms:`,
      jobError.message
    );

    return {
      success: false,
      error: jobError,
      processingTimeMs: processingTime,
    };
  }
}

// Handle job retry logic
async function handleJobRetry(
  channel: any,
  jobData: OtpJobPayload,
  error: Error
): Promise<void> {
  const nextRetryCount = jobData.retryCount + 1;

  if (nextRetryCount > config.maxRetries) {
    console.error(
      `[FAILED] Job ${jobData.jobId} exceeded max retries (${config.maxRetries})`
    );
    return;
  }

  const delay = calculateBackoffDelay(nextRetryCount);

  console.log(
    `[RETRY] Scheduling retry ${nextRetryCount}/${config.maxRetries} for job ${jobData.jobId} in ${delay}ms`
  );

  setTimeout(async () => {
    try {
      const retryPayload: OtpJobPayload = {
        ...jobData,
        retryCount: nextRetryCount,
        timestamp: Date.now(),
      };

      await channel.sendToQueue(
        config.queueName,
        Buffer.from(JSON.stringify(retryPayload)),
        { persistent: true }
      );

      console.log(`[RETRY] Job ${jobData.jobId} requeued successfully`);
    } catch (retryError) {
      console.error(
        `[RETRY ERROR] Failed to requeue job ${jobData.jobId}:`,
        retryError
      );
    }
  }, delay);
}

export async function startEmailWorker(): Promise<void> {
  let isShuttingDown = false;

  try {
    console.log(`[STARTUP] Starting OTP worker with config:`, config);

    const ch = await getChannel();
    await ch.assertQueue(config.queueName, {
      durable: true,
      // arguments: {
      //   "x-message-ttl": 24 * 60 * 60 * 1000, // 24 hours TTL
      // },
    });

    await ch.prefetch(config.prefetchCount);

    console.log(`[READY] OTP worker listening on queue: ${config.queueName}`);

    await ch.consume(
      config.queueName,
      async (msg: ConsumeMessage | null) => {
        if (!msg || isShuttingDown) return;

        try {
          const result = await processJob(msg);

          if (result.success) {
            ch.ack(msg);
          } else {
            // Parse job data for retry logic
            const rawData = JSON.parse(msg.content.toString());
            const jobData = validateJobPayload(rawData);

            await handleJobRetry(ch, jobData, result.error!);
            ch.ack(msg); // Always ack to remove from queue
          }
        } catch (error) {
          console.error(
            `[CONSUMER ERROR] Unexpected error processing message:`,
            error
          );
          ch.nack(msg, false, false); // Reject and don't requeue
        }
      },
      { noAck: false }
    );

    // Graceful shutdown handlers
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;

      console.log(
        `\n[SHUTDOWN] Received ${signal}. Shutting down gracefully...`
      );
      isShuttingDown = true;

      try {
        console.log("[SHUTDOWN] Closing RabbitMQ connection...");
        await closeConnection();
        console.log("[SHUTDOWN] OTP worker stopped successfully");
        process.exit(0);
      } catch (error) {
        console.error("[SHUTDOWN ERROR]", error);
        process.exit(1);
      }
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("[STARTUP ERROR] Failed to start OTP worker:", error);
    throw error;
  }
}
