/**
 * Token service for managing encrypted OTP payloads.
 *
 * NOTE: This service has been simplified for the OTP Relay pivot.
 * The old token-based permission system has been replaced with
 * encrypted OTP payload management.
 */

import type { DbClient, TokenRow } from '../lib/db';
import type { RedisClient } from '../lib/redis';
import { buildRedisKey } from '../lib/redis';
import { hashSHA256 } from '../lib/crypto';
import {
  calculateExpiresAt,
  toISOString,
  isExpired,
} from '../lib/utils';
import {
  OTP_DEFAULTS,
  OTP_REQUEST_STATUS,
} from '@orrisai/agent-otp-shared';

interface StoreOTPInput {
  requestId: string;
  encryptedPayload: string;
  source: string;
  sender?: string;
  subject?: string;
  ttlSeconds?: number;
}

interface OTPData {
  id: string;
  requestId: string;
  encryptedPayload: string;
  source: string;
  sender?: string;
  subject?: string;
  expiresAt: string;
}

interface TokenVerificationResult {
  valid: boolean;
  reason?: string;
  scope?: Record<string, unknown>;
  usesRemaining?: number;
  expiresAt?: string;
}

interface TokenUsageResult {
  success: boolean;
  usesRemaining: number;
  reason?: string;
}

/**
 * Token service for OTP payload management.
 */
export class TokenService {
  constructor(
    private db: DbClient,
    private redis: RedisClient
  ) {}

  /**
   * Stores an encrypted OTP payload for later consumption.
   */
  async storeEncryptedOTP(input: StoreOTPInput): Promise<void> {
    const expiresAt = calculateExpiresAt(
      input.ttlSeconds ?? OTP_DEFAULTS.DEFAULT_TTL_SECONDS
    );

    // Cache in Redis for fast retrieval
    const cacheData: OTPData = {
      id: input.requestId,
      requestId: input.requestId,
      encryptedPayload: input.encryptedPayload,
      source: input.source,
      sender: input.sender,
      subject: input.subject,
      expiresAt: toISOString(expiresAt),
    };

    const redisKey = buildRedisKey('OTP', input.requestId);
    const ttlSeconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

    await this.redis.set(redisKey, JSON.stringify(cacheData), {
      ex: ttlSeconds,
    });

    // TODO: Also store in database for persistence
  }

  /**
   * Retrieves and deletes an encrypted OTP payload (one-time read).
   */
  async consumeEncryptedOTP(requestId: string): Promise<OTPData | null> {
    const redisKey = buildRedisKey('OTP', requestId);

    // Get from cache
    const cached = await this.redis.get<string>(redisKey);

    if (!cached) {
      return null;
    }

    const otpData: OTPData =
      typeof cached === 'string' ? JSON.parse(cached) : cached;

    // Check expiration
    if (isExpired(otpData.expiresAt)) {
      await this.redis.del(redisKey);
      return null;
    }

    // Delete from cache (one-time read)
    await this.redis.del(redisKey);

    // Update request status to consumed
    // TODO: Update database status

    return otpData;
  }

  /**
   * Legacy method for backward compatibility - verifies a token.
   * @deprecated Use consumeEncryptedOTP instead
   */
  async verifyToken(
    token: string,
    permissionRequestId: string
  ): Promise<TokenVerificationResult> {
    // Placeholder for legacy compatibility
    return {
      valid: false,
      reason: 'Token verification deprecated - use OTP consumption',
    };
  }

  /**
   * Legacy method for backward compatibility - uses a token.
   * @deprecated Use consumeEncryptedOTP instead
   */
  async useToken(
    token: string,
    permissionRequestId: string,
    _actionDetails?: Record<string, unknown>
  ): Promise<TokenUsageResult> {
    // Placeholder for legacy compatibility
    return {
      success: false,
      usesRemaining: 0,
      reason: 'Token usage deprecated - use OTP consumption',
    };
  }

  /**
   * Creates a new token (legacy - placeholder).
   * @deprecated
   */
  async createToken(_input: {
    permissionRequestId: string;
    scope: Record<string, unknown>;
    ttlSeconds?: number;
  }): Promise<string> {
    throw new Error('Token creation deprecated - use OTP encryption');
  }
}

/**
 * Creates a new token service instance.
 */
export function createTokenService(
  db: DbClient,
  redis: RedisClient
): TokenService {
  return new TokenService(db, redis);
}
