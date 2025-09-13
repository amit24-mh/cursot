import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { handleDemo } from "./routes/demo";
import { connectDB } from "./db";
import { getNonce, verifySignature, me } from "./routes/auth";
import { listBlocks, submitVote } from "./routes/votes";

export function createServer() {
  const app = express();

  // ✅ Validate environment variables
  if (!process.env.DB_URI) {
    console.error("Missing environment variable: DB_URI");
    process.exit(1);
  }

  // ✅ Initialize DB (reuse connection if possible)
  connectDB().catch((e) => console.error("Mongo connection error:", e));

  // ✅ Security headers
  app.use(helmet());

  // ✅ Configure CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*", // restrict this in production
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  // ✅ Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
  });

  // ✅ Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  app.use("/api/", limiter);

  // ✅ Middleware for parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ✅ Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE || "pong";
    res.json({ success: true, message: ping });
  });

  // ✅ Demo route
  app.get("/api/demo", handleDemo);

  // ✅ Auth routes
  app.get("/api/auth/nonce", getNonce);
  app.post("/api/auth/verify", verifySignature);
  app.get("/api/me", me);

  // ✅ Votes and blocks routes
  app.post("/api/votes", submitVote);
  app.get("/api/blocks", listBlocks);

  // ✅ 404 Not Found handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
  });

  // ✅ Global error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  });

  return app;
}
