/**
 * Audit log query routes (for dashboard users).
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import type { Env } from '../lib/env';
import { createDbClient, type AuditLogRow } from '../lib/db';
import { createApiResponse } from '../lib/utils';
import { createAuditService } from '../services/audit-service';
import { auditEventTypeSchema, paginationSchema } from '@orrisai/agent-otp-shared';
import { HTTP_STATUS } from '@orrisai/agent-otp-shared';

const audit = new Hono<{ Bindings: Env }>();

// Query schema for audit logs
const auditQuerySchema = paginationSchema.extend({
  agentId: z.string().uuid().optional(),
  permissionRequestId: z.string().uuid().optional(),
  eventType: auditEventTypeSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Helper to get user ID from request.
 */
function getUserId(c: { req: { header: (name: string) => string | undefined } }): string {
  const userId = c.req.header('X-User-ID');
  if (!userId) {
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: 'User authentication required',
    });
  }
  return userId;
}

/**
 * GET /api/v1/audit
 * Query audit logs with filtering and pagination.
 */
audit.get(
  '/',
  zValidator('query', auditQuerySchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const query = c.req.valid('query');
    const auditService = createAuditService(db);

    const result = await auditService.query({
      userId,
      agentId: query.agentId,
      permissionRequestId: query.permissionRequestId,
      eventType: query.eventType,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      page: query.page,
      limit: query.limit,
    });

    return c.json(
      createApiResponse(result.logs, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      })
    );
  }
);

/**
 * GET /api/v1/audit/permissions/:id
 * Get the complete audit trail for a specific permission request.
 */
audit.get('/permissions/:id', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);
  const permissionRequestId = c.req.param('id');
  const auditService = createAuditService(db);

  // Verify the permission request belongs to a user's agent
  const { data: permRequest } = await db
    .from('permission_requests')
    .select('agent_id, agents!inner(user_id)')
    .eq('id', permissionRequestId)
    .single();

  if (!permRequest) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Permission request not found',
    });
  }

  // Handle both array and object response from Supabase joins
  const agents = Array.isArray(permRequest.agents) ? permRequest.agents[0] : permRequest.agents;
  const permData = {
    agent_id: permRequest.agent_id as string,
    agents: agents as { user_id: string },
  };

  if (permData.agents.user_id !== userId) {
    throw new HTTPException(HTTP_STATUS.FORBIDDEN, {
      message: 'Access denied',
    });
  }

  const auditTrail = await auditService.getPermissionAuditTrail(permissionRequestId);

  return c.json(createApiResponse(auditTrail));
});

/**
 * GET /api/v1/audit/agents/:id
 * Get audit logs for a specific agent.
 */
audit.get(
  '/agents/:id',
  zValidator('query', paginationSchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const agentId = c.req.param('id');
    const { page, limit } = c.req.valid('query');
    const auditService = createAuditService(db);

    // Verify the agent belongs to the user
    const { data: agent } = await db
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single();

    if (!agent) {
      throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
        message: 'Agent not found',
      });
    }

    const result = await auditService.query({
      agentId,
      page,
      limit,
    });

    return c.json(
      createApiResponse(result.logs, {
        page: result.page,
        limit: result.limit,
        total: result.total,
      })
    );
  }
);

/**
 * GET /api/v1/audit/stats
 * Get audit statistics for the user.
 */
audit.get('/stats', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);

  // Get counts by event type for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: stats, error } = await db
    .from('audit_logs')
    .select('event_type')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      message: 'Failed to fetch audit stats',
    });
  }

  const auditLogs = stats as Pick<AuditLogRow, 'event_type'>[] | null;

  // Count by event type
  const eventCounts: Record<string, number> = {};
  for (const log of auditLogs ?? []) {
    eventCounts[log.event_type] = (eventCounts[log.event_type] ?? 0) + 1;
  }

  return c.json(
    createApiResponse({
      period: '30d',
      total: auditLogs?.length ?? 0,
      byEventType: eventCounts,
    })
  );
});

export { audit };
