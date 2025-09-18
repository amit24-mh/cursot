import mongoose, { Schema, Types } from "mongoose";

/* ======================
   VOTER MODEL
====================== */
export interface IVoter {
  _id: Types.ObjectId;
  walletAddress: string; // always stored lowercase
  name?: string;
  nationalId?: string;
  email?: string;
  registeredAt: Date;
  lastLoginAt?: Date;
  nonce?: string; // for auth challenge
}

const VoterSchema = new Schema<IVoter>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true, // enforce lowercase
      trim: true,
    },
    name: { type: String, trim: true },
    nationalId: { type: String, trim: true },
    email: { type: String, trim: true },
    nonce: { type: String },
  },
  {
    timestamps: { createdAt: "registeredAt", updatedAt: "lastLoginAt" },
  }
);

export const VoterModel =
  mongoose.models.Voter || mongoose.model<IVoter>("Voter", VoterSchema);

/* ======================
   VOTE MODEL
====================== */
export interface IVote {
  _id: Types.ObjectId;
  voter: Types.ObjectId;
  electionId: string;
  candidateId: string;
  timestamp: Date;
  payloadHash: string; // keccak256 of canonical payload
  blockHash?: string; // hash of block containing this vote
}

const VoteSchema = new Schema<IVote>(
  {
    voter: {
      type: Schema.Types.ObjectId,
      ref: "Voter",
      required: true,
      index: true,
    },
    electionId: { type: String, required: true, index: true, trim: true },
    candidateId: { type: String, required: true, trim: true },
    payloadHash: {
      type: String,
      required: true,
      match: /^0x[a-fA-F0-9]{64}$/, // enforce keccak256 hex string
    },
    blockHash: { type: String, match: /^0x[a-fA-F0-9]{64}$/ },
  },
  {
    timestamps: { createdAt: "timestamp" },
  }
);

// ✅ Prevent duplicate votes per election
VoteSchema.index({ voter: 1, electionId: 1 }, { unique: true });

export const VoteModel =
  mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);

/* ======================
   BLOCK MODEL
====================== */
export interface IBlock {
  _id: Types.ObjectId;
  index: number;
  prevHash: string;
  timestamp: Date;
  merkleRoot: string;
  hash: string;
  signerAddress?: string; // if signed by an Ethereum EOA
  signature?: string;
  votes: Types.ObjectId[]; // vote ids included
}

const BlockSchema = new Schema<IBlock>(
  {
    index: { type: Number, required: true, unique: true },
    prevHash: {
      type: String,
      required: true,
      match: /^0x[a-fA-F0-9]{64}$/,
    },
    merkleRoot: {
      type: String,
      required: true,
      match: /^0x[a-fA-F0-9]{64}$/,
    },
    hash: {
      type: String,
      required: true,
      unique: true,
      match: /^0x[a-fA-F0-9]{64}$/,
    },
    signerAddress: { type: String, lowercase: true, trim: true },
    signature: { type: String },
    votes: [{ type: Schema.Types.ObjectId, ref: "Vote" }],
  },
  {
    timestamps: { createdAt: "timestamp" },
  }
);

export const BlockModel =
  mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);

