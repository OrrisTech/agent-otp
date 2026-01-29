/**
 * Redis client setup using Upstash for serverless Redis operations.
 */

import { Redis } from '@upstash/redis';
import type { Env } from './env';

/**
 * Creates an Upstash Redis client.
 */
export function createRedisClient(env: Env): Redis {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * Type alias for the Redis client.
 */
export type RedisClient = Redis;

/**
 * Redis key prefixes for different data types.
 */
export const REDIS_KEYS = {
  // Token storage: token:{token_hash} -> permission_request_id
  TOKEN: 'token:',
  // Rate limiting: rate:{agent_id}:{window} -> count
  RATE_LIMIT: 'rate:',
  // Pending approval: pending:{permission_id} -> request data
  PENDING_APPROVAL: 'pending:',
  // WebSocket session: ws:{permission_id} -> connection info
  WS_SESSION: 'ws:',
  // Agent session: agent_session:{agent_id} -> session data
  AGENT_SESSION: 'agent_session:',
} as const;

/**
 * Build a Redis key with proper prefixing.
 */
export function buildRedisKey(
  prefix: keyof typeof REDIS_KEYS,
  ...parts: string[]
): string {
  return REDIS_KEYS[prefix] + parts.join(':');
}
