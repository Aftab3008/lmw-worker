import amqplib from "amqplib";
import dotenv from "dotenv";

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;

if (!RABBITMQ_URL) {
  throw new Error("RABBITMQ_URL is not defined in .env");
}

const options: amqplib.Options.Connect = {
  heartbeat: 60,
};

let connection: any = null;
let channel: any = null;

export async function getChannel(): Promise<any> {
  if (channel) return channel;

  try {
    connection = await amqplib.connect(RABBITMQ_URL!, options);
    channel = await connection.createChannel();

    // Handle connection events
    connection.on("error", (err: Error) => {
      console.error("RabbitMQ connection error:", err);
      connection = null;
      channel = null;
    });

    connection.on("close", () => {
      console.log("RabbitMQ connection closed");
      connection = null;
      channel = null;
    });

    // Handle channel events
    channel.on("error", (err: Error) => {
      console.error("RabbitMQ channel error:", err);
      channel = null;
    });

    channel.on("close", () => {
      console.log("RabbitMQ channel closed");
      channel = null;
    });

    return channel;
  } catch (error) {
    console.error("Failed to create RabbitMQ channel:", error);
    connection = null;
    channel = null;
    throw error;
  }
}

export async function closeConnection(): Promise<void> {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
  } catch (error) {
    console.error("Error closing RabbitMQ connection:", error);
    // Don't throw here to allow graceful shutdown
  }
}

export function isConnected(): boolean {
  return !!(connection && channel);
}
