/**
 * Rate limiting middleware using Redis.
 */

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/env';
import { createRedisClient, buildRedisKey } from '../lib/redis';
import { RATE_LIMIT_DEFAULTS } from '@orrisai/agent-otp-shared';
import { getEnvVarAsNumber } from '../lib/env';

interface RateLimitConfig {
  // Maximum requests per window
  maxRequests?: number;
  // Window size in milliseconds
  windowMs?: number;
  // Key extractor function
  keyExtractor?: (c: Context) => string;
}

/**
 * Creates a rate limiting middleware.
 */
export function rateLimitMiddleware(config: RateLimitConfig = {}) {
  return async function rateLimit(
    c: Context<{ Bindings: Env }>,
    next: Next
  ) {
    const env = c.env;

    const maxRequests =
      config.maxRequests ??
      getEnvVarAsNumber(
        env,
        'RATE_LIMIT_REQUESTS',
        RATE_LIMIT_DEFAULTS.REQUESTS_PER_WINDOW
      );

    const windowMs =
      config.windowMs ??
      getEnvVarAsNumber(
        env,
        'RATE_LIMIT_WINDOW_MS',
        RATE_LIMIT_DEFAULTS.WINDOW_MS
      );

    // Extract rate limit key (default: IP address or agent ID)
    let key: string;
    if (config.keyExtractor) {
      key = config.keyExtractor(c);
    } else {
      // Try to get agent from context (set by auth middleware)
      // Using any here because Hono context variables are not typed at this middleware level
      const agent = (c as unknown as { get: (key: string) => { id: string } | undefined }).get('agent');
      key = agent?.id ?? c.req.header('CF-Connecting-IP') ?? 'anonymous';
    }

    const redis = createRedisClient(env);
    const windowKey = Math.floor(Date.now() / windowMs).toString();
    const redisKey = buildRedisKey('RATE_LIMIT', key, windowKey);

    try {
      // Increment counter and get current value
      const count = await redis.incr(redisKey);

      // Set expiry on first request in window
      if (count === 1) {
        await redis.expire(redisKey, Math.ceil(windowMs / 1000));
      }

      // Set rate limit headers
      c.header('X-RateLimit-Limit', maxRequests.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, maxRequests - count).toString());
      c.header('X-RateLimit-Reset', (Math.ceil(Date.now() / windowMs) * windowMs).toString());

      if (count > maxRequests) {
        throw new HTTPException(429, {
          message: 'Too many requests. Please try again later.',
        });
      }
    } catch (error) {
      // If Redis fails, allow the request (fail open)
      if (error instanceof HTTPException) {
        throw error;
      }
      console.error('Rate limit error:', error);
    }

    await next();
  };
}

/**
 * Per-agent rate limiting middleware.
 * More restrictive limits for permission requests.
 */
export function agentRateLimitMiddleware(
  maxRequests: number = 60,
  windowMs: number = 60000
) {
  return rateLimitMiddleware({
    maxRequests,
    windowMs,
    keyExtractor: (c) => {
      const agent = c.get('agent') as { id: string } | undefined;
      return agent?.id ?? 'unauthenticated';
    },
  });
}
