/**
 * Cryptographic utilities for Agent OTP Relay SDK.
 *
 * Provides end-to-end encryption for OTP codes using RSA-OAEP.
 * The agent generates a key pair, sends the public key to the server,
 * and uses the private key to decrypt OTPs.
 */

import { DecryptionError } from './errors';

/**
 * RSA-OAEP algorithm parameters for key generation.
 */
const RSA_ALGORITHM: RsaHashedKeyGenParams = {
  name: 'RSA-OAEP',
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]), // 65537
  hash: 'SHA-256',
};

/**
 * Key usages for RSA-OAEP encryption/decryption.
 */
const KEY_USAGES: KeyUsage[] = ['encrypt', 'decrypt'];

/**
 * Generate an RSA key pair for E2E encryption.
 *
 * The public key should be sent to the server when requesting an OTP.
 * The private key should be stored securely and used to decrypt OTPs.
 *
 * @example
 * ```typescript
 * const { publicKey, privateKey } = await generateKeyPair();
 *
 * // Request OTP with public key
 * const request = await client.requestOTP({
 *   reason: 'Sign up verification',
 *   publicKey: await exportPublicKey(publicKey),
 *   ...
 * });
 *
 * // Decrypt OTP with private key
 * const { code } = await client.consumeOTP(request.id, privateKey);
 * ```
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey(RSA_ALGORITHM, true, KEY_USAGES);
  return keyPair;
}

/**
 * Export a public key to base64-encoded SPKI format.
 *
 * This format is suitable for sending to the server.
 *
 * @param publicKey - The public key to export
 * @returns Base64-encoded public key
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', publicKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import a public key from base64-encoded SPKI format.
 *
 * @param publicKeyBase64 - Base64-encoded public key
 * @returns Imported CryptoKey
 */
export async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(publicKeyBase64);
  return crypto.subtle.importKey('spki', keyData, RSA_ALGORITHM, true, ['encrypt']);
}

/**
 * Export a private key to base64-encoded PKCS8 format.
 *
 * WARNING: Handle private keys with care. Store securely and never transmit.
 *
 * @param privateKey - The private key to export
 * @returns Base64-encoded private key
 */
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
  return arrayBufferToBase64(exported);
}

/**
 * Import a private key from base64-encoded PKCS8 format.
 *
 * @param privateKeyBase64 - Base64-encoded private key
 * @returns Imported CryptoKey
 */
export async function importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(privateKeyBase64);
  return crypto.subtle.importKey('pkcs8', keyData, RSA_ALGORITHM, true, ['decrypt']);
}

/**
 * Decrypt an OTP payload using the agent's private key.
 *
 * The payload was encrypted by the server using the agent's public key.
 *
 * @param encryptedPayload - Base64-encoded encrypted payload from the server
 * @param privateKey - The agent's private key
 * @returns Decrypted OTP code
 * @throws {DecryptionError} If decryption fails
 */
export async function decryptOTPPayload(
  encryptedPayload: string,
  privateKey: CryptoKey
): Promise<string> {
  try {
    const encryptedData = base64ToArrayBuffer(encryptedPayload);
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedData
    );
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    throw new DecryptionError(
      `Failed to decrypt OTP payload: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Encrypt data using a public key.
 *
 * This is primarily used for testing. In production, the server
 * encrypts OTPs before sending them to the agent.
 *
 * @param data - Data to encrypt
 * @param publicKey - The public key to encrypt with
 * @returns Base64-encoded encrypted data
 */
export async function encryptWithPublicKey(
  data: string,
  publicKey: CryptoKey
): Promise<string> {
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    encodedData
  );
  return arrayBufferToBase64(encryptedData);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert an ArrayBuffer to a base64 string.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i] as number);
  }
  return btoa(binary);
}

/**
 * Convert a base64 string to an ArrayBuffer.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
