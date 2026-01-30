/**
 * Utility functions for the API service.
 */

import { nanoid } from 'nanoid';
import { API_KEY_PREFIX, OTP_REQUEST_ID_PREFIX } from '@orrisai/agent-otp-shared';

/**
 * Generates a new API key for an agent.
 * Format: ak_<nanoid(32)>
 */
export function generateApiKey(): string {
  return `${API_KEY_PREFIX.AGENT}${nanoid(32)}`;
}

/**
 * Generates a new OTP request ID.
 * Format: otp_<nanoid(16)>
 */
export function generateOtpRequestId(): string {
  return `${OTP_REQUEST_ID_PREFIX}${nanoid(16)}`;
}

/**
 * Extracts the prefix from an API key.
 */
export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 8);
}

/**
 * Calculates expiration timestamp from TTL in seconds.
 */
export function calculateExpiresAt(ttlSeconds: number): Date {
  return new Date(Date.now() + ttlSeconds * 1000);
}

/**
 * Checks if a timestamp has expired.
 */
export function isExpired(expiresAt: Date | string): boolean {
  const expiration = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  return expiration.getTime() < Date.now();
}

/**
 * Converts a Date to ISO string for database storage.
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Deep merges two objects, with source values taking precedence.
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      sourceValue !== null &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === 'object' &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Safely gets a nested value from an object using dot notation path.
 * @example getValue({ a: { b: 1 } }, 'a.b') // returns 1
 */
export function getValue(
  obj: Record<string, unknown>,
  path: string
): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Creates a standardized API response.
 */
export function createApiResponse<T>(data: T, meta?: { page: number; limit: number; total: number }) {
  const response: {
    success: true;
    data: T;
    meta?: { page: number; limit: number; total: number; totalPages: number };
  } = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    };
  }

  return response;
}

/**
 * Creates a standardized API error response.
 */
export function createApiError(
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Masks sensitive data for logging.
 */
export function maskSensitive(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }
  return (
    value.substring(0, visibleChars) +
    '*'.repeat(value.length - visibleChars * 2) +
    value.substring(value.length - visibleChars)
  );
}
