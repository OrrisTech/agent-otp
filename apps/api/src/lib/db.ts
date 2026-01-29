/**
 * Database client setup using Supabase.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Env } from './env';

/**
 * Creates a Supabase client for database operations.
 */
export function createDbClient(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Type alias for the database client.
 */
export type DbClient = SupabaseClient;

// Database row types for better type inference
export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  telegram_chat_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface AgentRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  api_key_hash: string;
  api_key_prefix: string;
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyRow {
  id: string;
  user_id: string;
  agent_id: string | null;
  name: string;
  description: string | null;
  priority: number;
  conditions: Record<string, unknown>;
  action: string;
  scope_template: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionRequestRow {
  id: string;
  agent_id: string;
  action: string;
  resource: string | null;
  scope: Record<string, unknown>;
  context: Record<string, unknown>;
  status: string;
  policy_id: string | null;
  decision_reason: string | null;
  decided_by: string | null;
  decided_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface TokenRow {
  id: string;
  permission_request_id: string;
  token_hash: string;
  scope: Record<string, unknown>;
  uses_remaining: number;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  agent_id: string | null;
  permission_request_id: string | null;
  event_type: string;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
