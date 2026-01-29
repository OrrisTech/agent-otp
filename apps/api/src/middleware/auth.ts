/**
 * Authentication middleware for API key and JWT validation.
 */

import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/env';
import { createDbClient, type DbClient, type AgentRow } from '../lib/db';
import { verifyApiKey } from '../lib/crypto';
import { API_KEY_PREFIX } from '@orrisai/agent-otp-shared';

// Extended context with authenticated agent info
export interface AuthContext {
  agent: {
    id: string;
    userId: string;
    name: string;
    isActive: boolean;
  };
  db: DbClient;
}

/**
 * Extracts the API key from the Authorization header.
 * Supports format: Bearer <api_key> or just <api_key>
 */
function extractApiKey(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // Support both "Bearer <key>" and just "<key>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0]?.toLowerCase() === 'bearer') {
    return parts[1] ?? null;
  }

  // Direct API key in header
  if (authHeader.startsWith(API_KEY_PREFIX.AGENT)) {
    return authHeader;
  }

  return null;
}

/**
 * Authentication middleware for agent API key validation.
 * Adds authenticated agent info to context.
 */
export async function authMiddleware(
  c: Context<{ Bindings: Env; Variables: AuthContext }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');
  const apiKey = extractApiKey(authHeader);

  if (!apiKey) {
    throw new HTTPException(401, {
      message: 'Missing or invalid Authorization header',
    });
  }

  // Validate API key format
  if (!apiKey.startsWith(API_KEY_PREFIX.AGENT)) {
    throw new HTTPException(401, {
      message: 'Invalid API key format',
    });
  }

  // Get database client
  const db = createDbClient(c.env);

  // Extract prefix for quick lookup
  const prefix = apiKey.substring(0, 8);

  // Find agent by API key prefix
  const { data: agents, error: lookupError } = await db
    .from('agents')
    .select('id, user_id, name, api_key_hash, is_active')
    .eq('api_key_prefix', prefix)
    .limit(10);

  if (lookupError) {
    console.error('Database error during auth:', lookupError);
    throw new HTTPException(500, {
      message: 'Authentication service unavailable',
    });
  }

  const agentList = agents as AgentRow[] | null;

  if (!agentList || agentList.length === 0) {
    throw new HTTPException(401, {
      message: 'Invalid API key',
    });
  }

  // Verify the full API key against stored hashes
  let authenticatedAgent: AgentRow | null = null;

  for (const agent of agentList) {
    const isValid = await verifyApiKey(apiKey, agent.api_key_hash);
    if (isValid) {
      authenticatedAgent = agent;
      break;
    }
  }

  if (!authenticatedAgent) {
    throw new HTTPException(401, {
      message: 'Invalid API key',
    });
  }

  // Check if agent is active
  if (!authenticatedAgent.is_active) {
    throw new HTTPException(403, {
      message: 'Agent is deactivated',
    });
  }

  // Set authenticated agent in context
  c.set('agent', {
    id: authenticatedAgent.id,
    userId: authenticatedAgent.user_id,
    name: authenticatedAgent.name,
    isActive: authenticatedAgent.is_active,
  });
  c.set('db', db);

  await next();
}

/**
 * Optional authentication middleware.
 * Adds agent info if available, but doesn't fail if not authenticated.
 */
export async function optionalAuthMiddleware(
  c: Context<{ Bindings: Env; Variables: Partial<AuthContext> }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');
  const apiKey = extractApiKey(authHeader);

  // Create database client
  const db = createDbClient(c.env);
  c.set('db', db);

  if (!apiKey || !apiKey.startsWith(API_KEY_PREFIX.AGENT)) {
    await next();
    return;
  }

  try {
    const prefix = apiKey.substring(0, 8);

    const { data: agents } = await db
      .from('agents')
      .select('id, user_id, name, api_key_hash, is_active')
      .eq('api_key_prefix', prefix)
      .limit(10);

    const agentList = agents as AgentRow[] | null;

    if (agentList && agentList.length > 0) {
      for (const agent of agentList) {
        const isValid = await verifyApiKey(apiKey, agent.api_key_hash);
        if (isValid && agent.is_active) {
          c.set('agent', {
            id: agent.id,
            userId: agent.user_id,
            name: agent.name,
            isActive: agent.is_active,
          });
          break;
        }
      }
    }
  } catch {
    // Silently fail for optional auth
  }

  await next();
}
