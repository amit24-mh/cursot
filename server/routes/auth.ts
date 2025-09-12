import type { RequestHandler } from "express";
import { VoterModel } from "../models";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

function createNonce() {
  return randomBytes(16).toString("hex");
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is required");
  return secret;
}

export const getNonce: RequestHandler = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.status(503).json({ error: "database not configured" });
    const address = String(req.query.address || "").toLowerCase();
    if (!address) return res.status(400).json({ error: "address required" });

    let voter = await VoterModel.findOne({ walletAddress: address });
    const nonce = createNonce();
    if (!voter) {
      voter = await VoterModel.create({ walletAddress: address, nonce });
    } else {
      voter.nonce = nonce;
      await voter.save();
    }
    res.json({ nonce });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to generate nonce" });
  }
};

export const verifySignature: RequestHandler = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.status(503).json({ error: "database not configured" });
    const { address, signature, name, nationalId, email } = req.body || {};
    if (!address || !signature) return res.status(400).json({ error: "address and signature required" });
    const addr = String(address).toLowerCase();

    const voter = await VoterModel.findOne({ walletAddress: addr });
    if (!voter || !voter.nonce) return res.status(400).json({ error: "nonce not found; request a new nonce" });

    const message = `ChainVote login\nAddress: ${addr}\nNonce: ${voter.nonce}`;
    const recovered = ethers.verifyMessage(message, signature).toLowerCase();
    if (recovered !== addr) return res.status(401).json({ error: "invalid signature" });

    if (name) voter.name = name;
    if (nationalId) voter.nationalId = nationalId;
    if (email) voter.email = email;
    voter.lastLoginAt = new Date();
    voter.nonce = undefined;
    await voter.save();

    const token = jwt.sign({ sub: voter._id.toString(), address: addr }, getJwtSecret(), { expiresIn: "12h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "verification failed" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.status(503).json({ error: "database not configured" });
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "missing token" });
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string };
    const voter = await VoterModel.findById(payload.sub).lean();
    if (!voter) return res.status(404).json({ error: "voter not found" });
    res.json({
      id: voter._id,
      walletAddress: voter.walletAddress,
      name: voter.name,
      nationalId: voter.nationalId,
      email: voter.email,
      registeredAt: voter.registeredAt,
      lastLoginAt: voter.lastLoginAt,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "invalid token" });
  }
};
