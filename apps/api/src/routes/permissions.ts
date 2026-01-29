/**
 * Permission request routes for AI agents.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/env';
import type { AuthContext } from '../middleware/auth';
import type { PermissionRequestRow, UserRow } from '../lib/db';
import { authMiddleware } from '../middleware/auth';
import { agentRateLimitMiddleware } from '../middleware/rate-limit';
import { createDbClient } from '../lib/db';
import { createRedisClient } from '../lib/redis';
import { createPolicyEngine } from '../services/policy-engine';
import { createTokenService } from '../services/token-service';
import { createAuditService } from '../services/audit-service';
import { createNotificationService } from '../services/notification-service';
import {
  calculateExpiresAt,
  toISOString,
  createApiResponse,
  isExpired,
} from '../lib/utils';
import {
  createPermissionRequestSchema,
  verifyTokenSchema,
  useTokenSchema,
  approvalDecisionSchema,
} from '@orrisai/agent-otp-shared';
import {
  PERMISSION_STATUS,
  POLICY_ACTION,
  AUDIT_EVENT_TYPE,
  HTTP_STATUS,
} from '@orrisai/agent-otp-shared';

const permissions = new Hono<{
  Bindings: Env;
  Variables: AuthContext;
}>();

// Apply authentication and rate limiting to all routes
permissions.use('*', authMiddleware);
permissions.use('*', agentRateLimitMiddleware(60, 60000)); // 60 requests per minute

/**
 * POST /api/v1/permissions/request
 * Request a new permission for an operation.
 */
permissions.post(
  '/request',
  zValidator('json', createPermissionRequestSchema),
  async (c) => {
    const agent = c.get('agent');
    const db = c.get('db');
    const redis = createRedisClient(c.env);
    const body = c.req.valid('json');

    const policyEngine = createPolicyEngine(db);
    const tokenService = createTokenService(db, redis);
    const auditService = createAuditService(db);
    const notificationService = createNotificationService(c.env);

    // Evaluate against policies
    const decision = await policyEngine.evaluate(agent.userId, {
      agentId: agent.id,
      action: body.action,
      resource: body.resource,
      scope: body.scope,
      context: body.context,
    });

    // Calculate expiration
    const expiresAt = calculateExpiresAt(body.ttl);

    // Create permission request in database
    const { data: permRequest, error } = await db
      .from('permission_requests')
      .insert({
        agent_id: agent.id,
        action: body.action,
        resource: body.resource ?? null,
        scope: body.scope,
        context: body.context,
        status:
          decision.action === POLICY_ACTION.AUTO_APPROVE
            ? PERMISSION_STATUS.APPROVED
            : decision.action === POLICY_ACTION.DENY
              ? PERMISSION_STATUS.DENIED
              : PERMISSION_STATUS.PENDING,
        policy_id: decision.policy?.id ?? null,
        decision_reason: decision.reason ?? null,
        decided_by:
          decision.action !== POLICY_ACTION.REQUIRE_APPROVAL ? 'auto' : null,
        decided_at:
          decision.action !== POLICY_ACTION.REQUIRE_APPROVAL
            ? toISOString(new Date())
            : null,
        expires_at: toISOString(expiresAt),
      })
      .select('id')
      .single();

    if (error || !permRequest) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to create permission request',
      });
    }

    const permData = permRequest as { id: string };

    // Log the request
    await auditService.log({
      userId: agent.userId,
      agentId: agent.id,
      permissionRequestId: permData.id,
      eventType: AUDIT_EVENT_TYPE.REQUEST,
      details: {
        action: body.action,
        resource: body.resource,
        scope: body.scope,
        context: body.context,
        decision: decision.action,
      },
      ipAddress: c.req.header('CF-Connecting-IP') ?? undefined,
      userAgent: c.req.header('User-Agent') ?? undefined,
    });

    // Handle based on decision
    if (decision.action === POLICY_ACTION.DENY) {
      await auditService.log({
        userId: agent.userId,
        agentId: agent.id,
        permissionRequestId: permData.id,
        eventType: AUDIT_EVENT_TYPE.DENY,
        details: { reason: decision.reason },
      });

      return c.json(
        createApiResponse({
          id: permData.id,
          status: PERMISSION_STATUS.DENIED,
          reason: decision.reason,
          expiresAt: toISOString(expiresAt),
        }),
        HTTP_STATUS.OK
      );
    }

    if (decision.action === POLICY_ACTION.AUTO_APPROVE) {
      // Generate token immediately
      const finalScope = decision.scope ?? body.scope;
      const token = await tokenService.createToken({
        permissionRequestId: permData.id,
        scope: finalScope,
        ttlSeconds: body.ttl,
      });

      await auditService.log({
        userId: agent.userId,
        agentId: agent.id,
        permissionRequestId: permData.id,
        eventType: AUDIT_EVENT_TYPE.APPROVE,
        details: {
          decidedBy: 'auto',
          policyId: decision.policy?.id,
          scope: finalScope,
        },
      });

      return c.json(
        createApiResponse({
          id: permData.id,
          status: PERMISSION_STATUS.APPROVED,
          token,
          scope: finalScope,
          expiresAt: toISOString(expiresAt),
        }),
        HTTP_STATUS.CREATED
      );
    }

    // Requires human approval
    // Get user's Telegram chat ID for notification
    const { data: user } = await db
      .from('users')
      .select('telegram_chat_id')
      .eq('id', agent.userId)
      .single();

    const userData = user as Pick<UserRow, 'telegram_chat_id'> | null;

    if (userData?.telegram_chat_id) {
      await notificationService.sendTelegramApproval(userData.telegram_chat_id, {
        permissionRequestId: permData.id,
        agentName: agent.name,
        action: body.action,
        resource: body.resource,
        scope: body.scope,
        context: body.context,
        expiresAt: toISOString(expiresAt),
      });
    }

    const approvalUrl = `${c.env.DASHBOARD_URL}/approve/${permData.id}`;
    const webhookUrl = `wss://${c.env.API_BASE_URL.replace(/^https?:\/\//, '')}/ws/${permData.id}`;

    return c.json(
      createApiResponse({
        id: permData.id,
        status: PERMISSION_STATUS.PENDING,
        approvalUrl,
        webhookUrl,
        expiresAt: toISOString(expiresAt),
      }),
      HTTP_STATUS.ACCEPTED
    );
  }
);

/**
 * GET /api/v1/permissions/:id
 * Get the current status of a permission request.
 */
permissions.get('/:id', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db');
  const id = c.req.param('id');

  const { data: permRequest, error } = await db
    .from('permission_requests')
    .select('*')
    .eq('id', id)
    .eq('agent_id', agent.id)
    .single();

  if (error || !permRequest) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Permission request not found',
    });
  }

  const perm = permRequest as PermissionRequestRow;

  // Check if expired
  if (
    perm.status === PERMISSION_STATUS.PENDING &&
    isExpired(perm.expires_at)
  ) {
    // Mark as expired
    await db
      .from('permission_requests')
      .update({
        status: PERMISSION_STATUS.EXPIRED,
        decided_by: 'timeout',
        decided_at: toISOString(new Date()),
      })
      .eq('id', id);

    return c.json(
      createApiResponse({
        id: perm.id,
        status: PERMISSION_STATUS.EXPIRED,
        action: perm.action,
        resource: perm.resource,
        scope: perm.scope,
        context: perm.context,
        expiresAt: perm.expires_at,
        reason: 'Request expired before approval',
      })
    );
  }

  return c.json(
    createApiResponse({
      id: perm.id,
      status: perm.status,
      action: perm.action,
      resource: perm.resource,
      scope: perm.scope,
      context: perm.context,
      decisionReason: perm.decision_reason,
      decidedBy: perm.decided_by,
      decidedAt: perm.decided_at,
      expiresAt: perm.expires_at,
      createdAt: perm.created_at,
    })
  );
});

/**
 * POST /api/v1/permissions/:id/verify
 * Verify a token is still valid (doesn't consume it).
 */
permissions.post(
  '/:id/verify',
  zValidator('json', verifyTokenSchema),
  async (c) => {
    const agent = c.get('agent');
    const db = c.get('db');
    const redis = createRedisClient(c.env);
    const id = c.req.param('id');
    const body = c.req.valid('json');

    // Verify the permission request belongs to this agent
    const { data: permRequest, error } = await db
      .from('permission_requests')
      .select('agent_id')
      .eq('id', id)
      .single();

    const perm = permRequest as { agent_id: string } | null;

    if (error || !perm || perm.agent_id !== agent.id) {
      throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
        message: 'Permission request not found',
      });
    }

    const tokenService = createTokenService(db, redis);
    const result = await tokenService.verifyToken(body.token, id);

    return c.json(createApiResponse(result));
  }
);

/**
 * POST /api/v1/permissions/:id/use
 * Consume a token (marks it as used).
 */
permissions.post(
  '/:id/use',
  zValidator('json', useTokenSchema),
  async (c) => {
    const agent = c.get('agent');
    const db = c.get('db');
    const redis = createRedisClient(c.env);
    const id = c.req.param('id');
    const body = c.req.valid('json');

    // Verify the permission request belongs to this agent
    const { data: permRequest, error } = await db
      .from('permission_requests')
      .select('agent_id')
      .eq('id', id)
      .single();

    const perm = permRequest as { agent_id: string } | null;

    if (error || !perm || perm.agent_id !== agent.id) {
      throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
        message: 'Permission request not found',
      });
    }

    const tokenService = createTokenService(db, redis);
    const auditService = createAuditService(db);

    const result = await tokenService.useToken(
      body.token,
      id,
      body.actionDetails
    );

    if (result.success) {
      await auditService.log({
        userId: agent.userId,
        agentId: agent.id,
        permissionRequestId: id,
        eventType: AUDIT_EVENT_TYPE.USE,
        details: {
          actionDetails: body.actionDetails,
          usesRemaining: result.usesRemaining,
        },
        ipAddress: c.req.header('CF-Connecting-IP') ?? undefined,
        userAgent: c.req.header('User-Agent') ?? undefined,
      });
    }

    return c.json(createApiResponse(result));
  }
);

/**
 * POST /api/v1/permissions/:id/decide
 * Human approval decision (called from dashboard or Telegram bot).
 * This is a protected internal endpoint.
 */
permissions.post(
  '/:id/decide',
  zValidator('json', approvalDecisionSchema),
  async (c) => {
    const db = createDbClient(c.env);
    const redis = createRedisClient(c.env);
    const id = c.req.param('id');
    const body = c.req.valid('json');

    // Get the permission request
    const { data: permRequest, error } = await db
      .from('permission_requests')
      .select('*, agents!inner(user_id, name)')
      .eq('id', id)
      .single();

    if (error || !permRequest) {
      throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
        message: 'Permission request not found',
      });
    }

    const perm = permRequest as PermissionRequestRow & { agents: { user_id: string; name: string } };

    // Check if already decided
    if (perm.status !== PERMISSION_STATUS.PENDING) {
      throw new HTTPException(HTTP_STATUS.CONFLICT, {
        message: `Permission request already ${perm.status}`,
      });
    }

    // Check if expired
    if (isExpired(perm.expires_at)) {
      throw new HTTPException(HTTP_STATUS.CONFLICT, {
        message: 'Permission request has expired',
      });
    }

    const auditService = createAuditService(db);
    const tokenService = createTokenService(db, redis);
    const agentData = perm.agents;

    if (body.approved) {
      // Update status
      await db
        .from('permission_requests')
        .update({
          status: PERMISSION_STATUS.APPROVED,
          decision_reason: body.reason ?? 'Manually approved',
          decided_by: 'user',
          decided_at: toISOString(new Date()),
        })
        .eq('id', id);

      // Merge scope modifications if provided
      const finalScope = body.scopeModifications
        ? { ...perm.scope, ...body.scopeModifications }
        : perm.scope;

      // Calculate remaining TTL
      const expiresAt = new Date(perm.expires_at);
      const remainingTtl = Math.max(
        30, // Minimum 30 seconds
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );

      // Generate token
      const token = await tokenService.createToken({
        permissionRequestId: id,
        scope: finalScope,
        ttlSeconds: remainingTtl,
      });

      await auditService.log({
        userId: agentData.user_id,
        agentId: perm.agent_id,
        permissionRequestId: id,
        eventType: AUDIT_EVENT_TYPE.APPROVE,
        details: {
          decidedBy: 'user',
          reason: body.reason,
          scope: finalScope,
        },
      });

      return c.json(
        createApiResponse({
          id,
          status: PERMISSION_STATUS.APPROVED,
          token,
          scope: finalScope,
          expiresAt: perm.expires_at,
        })
      );
    } else {
      // Denied
      await db
        .from('permission_requests')
        .update({
          status: PERMISSION_STATUS.DENIED,
          decision_reason: body.reason ?? 'Manually denied',
          decided_by: 'user',
          decided_at: toISOString(new Date()),
        })
        .eq('id', id);

      await auditService.log({
        userId: agentData.user_id,
        agentId: perm.agent_id,
        permissionRequestId: id,
        eventType: AUDIT_EVENT_TYPE.DENY,
        details: {
          decidedBy: 'user',
          reason: body.reason,
        },
      });

      return c.json(
        createApiResponse({
          id,
          status: PERMISSION_STATUS.DENIED,
          reason: body.reason ?? 'Request denied',
          expiresAt: perm.expires_at,
        })
      );
    }
  }
);

export { permissions };
