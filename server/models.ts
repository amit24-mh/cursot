import mongoose, { Schema, Types } from "mongoose";

export interface IVoter {
  _id: Types.ObjectId;
  walletAddress: string; // lowercased
  name?: string;
  nationalId?: string;
  email?: string;
  registeredAt: Date;
  lastLoginAt?: Date;
  nonce?: string; // for auth challenge
}

const VoterSchema = new Schema<IVoter>({
  walletAddress: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  nationalId: { type: String },
  email: { type: String },
  registeredAt: { type: Date, default: () => new Date() },
  lastLoginAt: { type: Date },
  nonce: { type: String },
});

export const VoterModel = mongoose.models.Voter || mongoose.model<IVoter>("Voter", VoterSchema);

export interface IVote {
  _id: Types.ObjectId;
  voter: Types.ObjectId;
  electionId: string;
  candidateId: string;
  timestamp: Date;
  payloadHash: string; // keccak256 of canonical payload
  blockHash?: string; // hash of block containing this vote
}

const VoteSchema = new Schema<IVote>({
  voter: { type: Schema.Types.ObjectId, ref: "Voter", required: true, index: true },
  electionId: { type: String, required: true, index: true },
  candidateId: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
  payloadHash: { type: String, required: true },
  blockHash: { type: String },
});

export const VoteModel = mongoose.models.Vote || mongoose.model<IVote>("Vote", VoteSchema);

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

const BlockSchema = new Schema<IBlock>({
  index: { type: Number, required: true, unique: true },
  prevHash: { type: String, required: true },
  timestamp: { type: Date, default: () => new Date() },
  merkleRoot: { type: String, required: true },
  hash: { type: String, required: true, unique: true },
  signerAddress: { type: String },
  signature: { type: String },
  votes: [{ type: Schema.Types.ObjectId, ref: "Vote" }],
});

export const BlockModel = mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);
