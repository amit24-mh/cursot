import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set; API will run without DB connection.");
    return;
  }
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || undefined });
  console.log("MongoDB connected");
}
