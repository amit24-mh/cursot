import type { BlocksResponse, MeResponse, NonceResponse, VerifyRequest, VerifyResponse } from "@shared/api";

export async function getNonce(address: string): Promise<NonceResponse> {
  const res = await fetch(`/api/auth/nonce?address=${address}`);
  if (!res.ok) throw new Error("Failed to get nonce");
  return res.json();
}

export async function verifySignature(payload: VerifyRequest): Promise<VerifyResponse> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Verification failed");
  return res.json();
}

export async function me(token: string): Promise<MeResponse> {
  const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function getBlocks(): Promise<BlocksResponse> {
  const res = await fetch("/api/blocks");
  if (!res.ok) throw new Error("Failed to load blocks");
  return res.json();
}
