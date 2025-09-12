import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import { getNonce, verifySignature, me } from "./routes/auth";
import { listBlocks, submitVote } from "./routes/votes";

export function createServer() {
  const app = express();

  // Initialize DB (non-blocking if no URI)
  connectDB().catch((e) => console.error("Mongo connection error:", e));

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Auth
  app.get("/api/auth/nonce", getNonce);
  app.post("/api/auth/verify", verifySignature);
  app.get("/api/me", me);

  // Votes & Blocks
  app.post("/api/votes", submitVote);
  app.get("/api/blocks", listBlocks);

  return app;
}
