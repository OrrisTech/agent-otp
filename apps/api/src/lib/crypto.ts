/**
 * Cryptographic utilities for hashing and token generation.
 * Uses Web Crypto API for Cloudflare Workers compatibility.
 */

/**
 * Hashes a value using SHA-256.
 * Used for token verification (not for passwords).
 */
export async function hashSHA256(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes an API key for storage.
 * Uses PBKDF2 with a random salt for secure password-like hashing.
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiKey),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Format: salt$hash
  return `${saltHex}$${hashHex}`;
}

/**
 * Verifies an API key against its stored hash.
 */
export async function verifyApiKey(
  apiKey: string,
  storedHash: string
): Promise<boolean> {
  const [saltHex, _storedHashHex] = storedHash.split('$');

  if (!saltHex || !_storedHashHex) {
    return false;
  }

  const encoder = new TextEncoder();

  // Convert salt back to Uint8Array
  const salt = new Uint8Array(
    saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
  );

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(apiKey),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const computedHashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return computedHashHex === _storedHashHex;
}

/**
 * Generates a cryptographically secure random string.
 */
export function generateSecureRandom(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);

  let result = 0;
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i]! ^ bBytes[i]!;
  }

  return result === 0;
}
