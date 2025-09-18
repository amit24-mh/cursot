import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import { getNonce, verifySignature, me } from "./routes/auth";
import { listBlocks, submitVote } from "./routes/votes";

// 🔹 Helper for async error handling
const asyncHandler =
  (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

function validateEnv() {
  const required = ["DB_URI"];
  required.forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing environment variable: ${key}`);
      process.exit(1);
    }
  });
}

export function createServer() {
  validateEnv();
  const app = express();

  // ✅ Connect DB
  connectDB().catch((e) => console.error("Mongo connection error:", e));

  // ✅ Security headers
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? undefined : false,
    })
  );

  // ✅ CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ✅ Logging
  app.use(morgan("combined"));

  // ✅ Rate limiting
  const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
  app.use("/api/", generalLimiter);
  app.use("/api/auth/", authLimiter);

  // ✅ Middleware for parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ success: true, message: process.env.PING_MESSAGE || "pong" });
  });

  // ✅ Routes
  app.get("/api/demo", asyncHandler(handleDemo));
  app.get("/api/auth/nonce", asyncHandler(getNonce));
  app.post("/api/auth/verify", asyncHandler(verifySignature));
  app.get("/api/me", asyncHandler(me));
  app.post("/api/votes", asyncHandler(submitVote));
  app.get("/api/blocks", asyncHandler(listBlocks));

  // ✅ 404
  app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
  });

  // ✅ Global error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack || err);
    res.status(500).json({ success: false, error: "Internal server error" });
  });

  return app;
}

