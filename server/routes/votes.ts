import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { VoteModel, VoterModel, BlockModel } from "../models";
import { ethers } from "ethers";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET env var is required");
  return secret;
}

function auth(req: any) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) throw new Error("unauthorized");
  const payload = jwt.verify(token, getJwtSecret()) as { sub: string; address: string };
  return payload;
}

export const submitVote: RequestHandler = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.status(503).json({ error: "database not configured" });
    const { sub } = auth(req);
    const { electionId, candidateId } = req.body || {};
    if (!electionId || !candidateId) return res.status(400).json({ error: "electionId and candidateId required" });

    const voter = await VoterModel.findById(sub);
    if (!voter) return res.status(404).json({ error: "voter not found" });

    const canonical = JSON.stringify({ electionId, candidateId, voter: voter.walletAddress });
    const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(canonical));

    const vote = await VoteModel.create({ voter: voter._id, electionId, candidateId, payloadHash });

    // Append to chain by creating a single-vote block (concept demo)
    const lastBlock = await BlockModel.findOne({}, {}, { sort: { index: -1 } });
    const prevHash = lastBlock?.hash || ethers.ZeroHash;
    const merkleRoot = payloadHash; // single tx block
    const index = (lastBlock?.index || 0) + 1;
    const blockHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify({ index, prevHash, merkleRoot }))
    );

    await BlockModel.create({ index, prevHash, merkleRoot, hash: blockHash, votes: [vote._id] });
    vote.blockHash = blockHash;
    await vote.save();

    res.json({ id: vote._id, payloadHash, blockHash });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "failed to submit vote" });
  }
};

export const listBlocks: RequestHandler = async (_req, res) => {
  try {
    if (!process.env.MONGODB_URI) return res.json({ blocks: [] });
    const blocks = await BlockModel.find({}, { _id: 0, __v: 0 }).sort({ index: -1 }).limit(20).lean();
    res.json({ blocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch blocks" });
  }
};
