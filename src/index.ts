import dotenv from "dotenv";
import { startEmailWorker } from "./workers/otp.workers.js";
dotenv.config();

if (process.env.WORKER === "true") {
  await startEmailWorker();
} else {
  console.log("Set WORKER=true to start the Email worker");
}
