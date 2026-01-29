/**
 * Audit service for logging all system events.
 */

import type { DbClient, AuditLogRow } from '../lib/db';
import type { AuditEventType } from '@orrisai/agent-otp-shared';

interface AuditLogInput {
  userId?: string;
  agentId?: string;
  permissionRequestId?: string;
  eventType: AuditEventType;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLogFilter {
  userId?: string;
  agentId?: string;
  permissionRequestId?: string;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

interface AuditLogEntry {
  id: string;
  userId: string | null;
  agentId: string | null;
  permissionRequestId: string | null;
  eventType: string;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface PaginatedAuditLogs {
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Audit service for immutable event logging.
 */
export class AuditService {
  constructor(private db: DbClient) {}

  /**
   * Logs an audit event.
   */
  async log(input: AuditLogInput): Promise<void> {
    const { error } = await this.db.from('audit_logs').insert({
      user_id: input.userId ?? null,
      agent_id: input.agentId ?? null,
      permission_request_id: input.permissionRequestId ?? null,
      event_type: input.eventType,
      details: input.details ?? {},
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent ?? null,
    });

    if (error) {
      // Log error but don't throw - audit logging should not break the main flow
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Queries audit logs with filtering and pagination.
   */
  async query(filter: AuditLogFilter): Promise<PaginatedAuditLogs> {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build query
    let query = this.db
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }

    if (filter.agentId) {
      query = query.eq('agent_id', filter.agentId);
    }

    if (filter.permissionRequestId) {
      query = query.eq('permission_request_id', filter.permissionRequestId);
    }

    if (filter.eventType) {
      query = query.eq('event_type', filter.eventType);
    }

    if (filter.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString());
    }

    if (filter.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString());
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to query audit logs: ${error.message}`);
    }

    const rawLogs = data as AuditLogRow[] | null;

    const logs: AuditLogEntry[] = (rawLogs ?? []).map((log) => ({
      id: log.id,
      userId: log.user_id,
      agentId: log.agent_id,
      permissionRequestId: log.permission_request_id,
      eventType: log.event_type,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    }));

    return {
      logs,
      total: count ?? 0,
      page,
      limit,
    };
  }

  /**
   * Gets the audit trail for a specific permission request.
   */
  async getPermissionAuditTrail(
    permissionRequestId: string
  ): Promise<AuditLogEntry[]> {
    const { data, error } = await this.db
      .from('audit_logs')
      .select('*')
      .eq('permission_request_id', permissionRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get audit trail: ${error.message}`);
    }

    const rawLogs = data as AuditLogRow[] | null;

    return (rawLogs ?? []).map((log) => ({
      id: log.id,
      userId: log.user_id,
      agentId: log.agent_id,
      permissionRequestId: log.permission_request_id,
      eventType: log.event_type,
      details: log.details,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    }));
  }
}

/**
 * Creates a new audit service instance.
 */
export function createAuditService(db: DbClient): AuditService {
  return new AuditService(db);
}
