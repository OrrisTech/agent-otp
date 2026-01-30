/**
 * Encryption utilities for OTP payload
 *
 * Uses RSA-OAEP with SHA-256 to encrypt OTP codes with the agent's public key.
 * Only the agent holding the corresponding private key can decrypt.
 *
 * NOTE: React Native doesn't have native Web Crypto API.
 * For production, use react-native-quick-crypto or expo-crypto.
 * This is a placeholder that would need native implementation.
 */

/**
 * Encrypted payload structure
 */
export interface EncryptedPayload {
  version: 1;
  algorithm: 'RSA-OAEP-SHA256';
  encrypted: string; // base64-encoded encrypted OTP
  timestamp: string; // ISO timestamp
}

/**
 * Encrypt OTP with agent's public key
 *
 * NOTE: This is a placeholder implementation.
 * In production, use react-native-quick-crypto or a native module.
 */
export async function encryptOTP(
  otp: string,
  publicKeyBase64: string
): Promise<string> {
  // TODO: Implement actual RSA-OAEP encryption
  // For now, return a mock encrypted payload for development

  // In production, you would:
  // 1. Import the public key from base64 SPKI format
  // 2. Encrypt the OTP using RSA-OAEP with SHA-256
  // 3. Return the encrypted data as base64

  console.warn('[Encryption] Using mock encryption - implement native crypto');

  const payload: EncryptedPayload = {
    version: 1,
    algorithm: 'RSA-OAEP-SHA256',
    encrypted: Buffer.from(`mock_encrypted:${otp}`).toString('base64'),
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(payload);
}

/**
 * Verify a public key is valid
 */
export function isValidPublicKey(publicKeyBase64: string): boolean {
  try {
    // Basic validation - check it's valid base64 and reasonable length
    const decoded = Buffer.from(publicKeyBase64, 'base64');
    return decoded.length > 100 && decoded.length < 1000;
  } catch {
    return false;
  }
}
