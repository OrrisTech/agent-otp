/**
 * Token service for generating, verifying, and managing OTP tokens.
 */

import type { DbClient, TokenRow } from '../lib/db';
import type { RedisClient } from '../lib/redis';
import { buildRedisKey } from '../lib/redis';
import { hashSHA256 } from '../lib/crypto';
import {
  generateOtpToken,
  calculateExpiresAt,
  toISOString,
  isExpired,
} from '../lib/utils';
import {
  TOKEN_DEFAULTS,
  PERMISSION_STATUS,
  type TokenVerificationResult,
  type TokenUsageResult,
} from '@orrisai/agent-otp-shared';

interface CreateTokenInput {
  permissionRequestId: string;
  scope: Record<string, unknown>;
  usesRemaining?: number;
  ttlSeconds?: number;
}

interface TokenData {
  id: string;
  permissionRequestId: string;
  scope: Record<string, unknown>;
  usesRemaining: number;
  expiresAt: string;
}

/**
 * Token service for OTP token management.
 */
export class TokenService {
  constructor(
    private db: DbClient,
    private redis: RedisClient
  ) {}

  /**
   * Creates a new OTP token for an approved permission request.
   * Returns the token (only time it's returned in plain text).
   */
  async createToken(input: CreateTokenInput): Promise<string> {
    const token = generateOtpToken();
    const tokenHash = await hashSHA256(token);
    const expiresAt = calculateExpiresAt(
      input.ttlSeconds ?? TOKEN_DEFAULTS.DEFAULT_TTL_SECONDS
    );
    const usesRemaining = input.usesRemaining ?? TOKEN_DEFAULTS.DEFAULT_USES;

    // Store in database
    const { data, error } = await this.db
      .from('tokens')
      .insert({
        permission_request_id: input.permissionRequestId,
        token_hash: tokenHash,
        scope: input.scope,
        uses_remaining: usesRemaining,
        expires_at: toISOString(expiresAt),
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(`Failed to create token: ${error?.message}`);
    }

    const insertedData = data as { id: string };

    // Cache in Redis for fast verification
    const cacheData: TokenData = {
      id: insertedData.id,
      permissionRequestId: input.permissionRequestId,
      scope: input.scope,
      usesRemaining,
      expiresAt: toISOString(expiresAt),
    };

    const redisKey = buildRedisKey('TOKEN', tokenHash);
    const ttlSeconds = Math.ceil((expiresAt.getTime() - Date.now()) / 1000);

    await this.redis.set(redisKey, JSON.stringify(cacheData), {
      ex: ttlSeconds,
    });

    return token;
  }

  /**
   * Verifies a token without consuming it.
   */
  async verifyToken(
    token: string,
    permissionRequestId: string
  ): Promise<TokenVerificationResult> {
    const tokenHash = await hashSHA256(token);
    const redisKey = buildRedisKey('TOKEN', tokenHash);

    // Try cache first
    const cached = await this.redis.get<string>(redisKey);

    if (cached) {
      const tokenData: TokenData =
        typeof cached === 'string' ? JSON.parse(cached) : cached;

      // Verify permission request ID matches
      if (tokenData.permissionRequestId !== permissionRequestId) {
        return {
          valid: false,
          reason: 'Token does not match permission request',
        };
      }

      // Check expiration
      if (isExpired(tokenData.expiresAt)) {
        return { valid: false, reason: 'Token has expired' };
      }

      // Check uses remaining
      if (tokenData.usesRemaining === 0) {
        return { valid: false, reason: 'Token has been fully consumed' };
      }

      return {
        valid: true,
        scope: tokenData.scope,
        usesRemaining: tokenData.usesRemaining,
        expiresAt: tokenData.expiresAt,
      };
    }

    // Fallback to database
    const { data: tokenRecord, error } = await this.db
      .from('tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('permission_request_id', permissionRequestId)
      .is('revoked_at', null)
      .single();

    if (error || !tokenRecord) {
      return { valid: false, reason: 'Token not found' };
    }

    const dbToken = tokenRecord as TokenRow;

    // Check expiration
    if (isExpired(dbToken.expires_at)) {
      return { valid: false, reason: 'Token has expired' };
    }

    // Check uses remaining
    if (dbToken.uses_remaining === 0) {
      return { valid: false, reason: 'Token has been fully consumed' };
    }

    return {
      valid: true,
      scope: dbToken.scope,
      usesRemaining: dbToken.uses_remaining,
      expiresAt: dbToken.expires_at,
    };
  }

  /**
   * Consumes a token, decrementing its use count.
   */
  async useToken(
    token: string,
    permissionRequestId: string,
    _actionDetails?: Record<string, unknown>
  ): Promise<TokenUsageResult> {
    const tokenHash = await hashSHA256(token);
    const redisKey = buildRedisKey('TOKEN', tokenHash);

    // Verify token first
    const verification = await this.verifyToken(token, permissionRequestId);

    if (!verification.valid) {
      return {
        success: false,
        usesRemaining: 0,
        reason: verification.reason,
      };
    }

    // Decrement uses in database
    const { data: tokenRecord, error } = await this.db
      .from('tokens')
      .select('id, uses_remaining')
      .eq('token_hash', tokenHash)
      .eq('permission_request_id', permissionRequestId)
      .is('revoked_at', null)
      .single();

    if (error || !tokenRecord) {
      return {
        success: false,
        usesRemaining: 0,
        reason: 'Token not found',
      };
    }

    const dbToken = tokenRecord as Pick<TokenRow, 'id' | 'uses_remaining'>;

    // Calculate new uses remaining (-1 means unlimited)
    const currentUses = dbToken.uses_remaining;
    const newUsesRemaining = currentUses === -1 ? -1 : currentUses - 1;

    // Update database
    const updateData: {
      uses_remaining: number;
      used_at?: string;
    } = {
      uses_remaining: newUsesRemaining,
    };

    // Mark as used if this is the last use
    if (newUsesRemaining === 0) {
      updateData.used_at = toISOString(new Date());

      // Also update permission request status
      await this.db
        .from('permission_requests')
        .update({ status: PERMISSION_STATUS.USED })
        .eq('id', permissionRequestId);
    }

    await this.db
      .from('tokens')
      .update(updateData)
      .eq('id', dbToken.id);

    // Update cache if not expired
    if (newUsesRemaining === 0) {
      // Remove from cache when fully consumed
      await this.redis.del(redisKey);
    } else {
      // Update cache with new uses remaining
      const cachedStr = await this.redis.get<string>(redisKey);
      if (cachedStr) {
        const tokenData: TokenData =
          typeof cachedStr === 'string' ? JSON.parse(cachedStr) : cachedStr;
        tokenData.usesRemaining = newUsesRemaining;

        const ttlSeconds = Math.ceil(
          (new Date(tokenData.expiresAt).getTime() - Date.now()) / 1000
        );
        if (ttlSeconds > 0) {
          await this.redis.set(redisKey, JSON.stringify(tokenData), {
            ex: ttlSeconds,
          });
        }
      }
    }

    return {
      success: true,
      usesRemaining: newUsesRemaining,
    };
  }

  /**
   * Revokes a token, making it permanently invalid.
   */
  async revokeToken(
    token: string,
    permissionRequestId: string
  ): Promise<boolean> {
    const tokenHash = await hashSHA256(token);
    const redisKey = buildRedisKey('TOKEN', tokenHash);

    // Update database
    const { error } = await this.db
      .from('tokens')
      .update({ revoked_at: toISOString(new Date()) })
      .eq('token_hash', tokenHash)
      .eq('permission_request_id', permissionRequestId);

    if (error) {
      console.error('Failed to revoke token:', error);
      return false;
    }

    // Remove from cache
    await this.redis.del(redisKey);

    return true;
  }

  /**
   * Revokes all tokens for a permission request.
   */
  async revokeAllTokensForRequest(permissionRequestId: string): Promise<void> {
    // Get all token hashes for this request
    const { data: tokens } = await this.db
      .from('tokens')
      .select('token_hash')
      .eq('permission_request_id', permissionRequestId)
      .is('revoked_at', null);

    const tokenList = tokens as Pick<TokenRow, 'token_hash'>[] | null;

    if (tokenList && tokenList.length > 0) {
      // Revoke in database
      await this.db
        .from('tokens')
        .update({ revoked_at: toISOString(new Date()) })
        .eq('permission_request_id', permissionRequestId);

      // Remove from cache
      const redisKeys = tokenList.map((t) => buildRedisKey('TOKEN', t.token_hash));
      await Promise.all(redisKeys.map((key) => this.redis.del(key)));
    }
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
