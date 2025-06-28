import dotenv from "dotenv";
import { startEmailWorker } from "./workers/otp.workers.js";
import express from "express";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Email Worker is running");
});

await startEmailWorker();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
