/**
 * Encryption utilities for OTP payload
 *
 * Uses RSA-OAEP with SHA-256 to encrypt OTP codes with the agent's public key.
 * Only the agent holding the corresponding private key can decrypt.
 */

import { webcrypto } from 'node:crypto';

// Use Node.js Web Crypto API
const crypto = webcrypto as unknown as Crypto;

/**
 * Import a public key from base64-encoded SPKI format
 */
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const keyData = Buffer.from(publicKeyBase64, 'base64');

  return crypto.subtle.importKey(
    'spki',
    keyData,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false,
    ['encrypt']
  );
}

/**
 * Encrypt OTP payload with agent's public key
 */
export async function encryptOTPPayload(
  otp: string,
  publicKeyBase64: string
): Promise<string> {
  const publicKey = await importPublicKey(publicKeyBase64);

  // Encode OTP as UTF-8 bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);

  // Encrypt with RSA-OAEP
  const encrypted = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    data
  );

  // Return as base64
  return Buffer.from(encrypted).toString('base64');
}

/**
 * Create a complete encrypted payload with metadata
 */
export interface EncryptedPayload {
  version: 1;
  algorithm: 'RSA-OAEP-SHA256';
  encrypted: string; // base64-encoded encrypted OTP
  timestamp: string; // ISO timestamp
}

export async function createEncryptedPayload(
  otp: string,
  publicKeyBase64: string
): Promise<string> {
  const encrypted = await encryptOTPPayload(otp, publicKeyBase64);

  const payload: EncryptedPayload = {
    version: 1,
    algorithm: 'RSA-OAEP-SHA256',
    encrypted,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(payload);
}
