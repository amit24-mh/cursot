/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface NonceResponse { nonce: string }

export interface VerifyRequest {
  address: string;
  signature: string;
  name?: string;
  nationalId?: string;
  email?: string;
}

export interface VerifyResponse { token: string }

export interface MeResponse {
  id: string;
  walletAddress: string;
  name?: string;
  nationalId?: string;
  email?: string;
  registeredAt: string;
  lastLoginAt?: string;
}

export interface BlockSummary {
  index: number;
  prevHash: string;
  timestamp: string;
  merkleRoot: string;
  hash: string;
  signerAddress?: string;
}

export interface BlocksResponse { blocks: BlockSummary[] }
