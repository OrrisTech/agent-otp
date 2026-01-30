/**
 * OTP request routes for AI agents.
 *
 * NOTE: This is a placeholder implementation. The full OTP Relay API
 * will be implemented in a future phase.
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/env';
import type { AuthContext } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { agentRateLimitMiddleware } from '../middleware/rate-limit';
import { createDbClient } from '../lib/db';
import { createRedisClient } from '../lib/redis';
import { createAuditService } from '../services/audit-service';
import {
  calculateExpiresAt,
  toISOString,
  createApiResponse,
  generateOtpRequestId,
} from '../lib/utils';
import {
  createOTPRequestSchema,
} from '@orrisai/agent-otp-shared';
import {
  OTP_REQUEST_STATUS,
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
 * POST /api/v1/otp/request
 * Request a new OTP relay.
 */
permissions.post(
  '/request',
  zValidator('json', createOTPRequestSchema),
  async (c) => {
    const agent = c.get('agent');
    const db = c.get('db');
    const body = c.req.valid('json');

    const auditService = createAuditService(db);

    // Calculate expiration
    const expiresAt = calculateExpiresAt(body.ttl ?? 300);

    // Generate request ID
    const requestId = generateOtpRequestId();

    // Log the request
    await auditService.log({
      userId: agent.userId,
      agentId: agent.id,
      permissionRequestId: requestId,
      eventType: AUDIT_EVENT_TYPE.OTP_REQUEST,
      details: {
        reason: body.reason,
        expectedSender: body.expectedSender,
        filter: body.filter,
      },
      ipAddress: c.req.header('CF-Connecting-IP') ?? undefined,
      userAgent: c.req.header('User-Agent') ?? undefined,
    });

    // TODO: Implement full OTP request flow
    // 1. Store request in database
    // 2. Send notification to user for approval
    // 3. Wait for OTP to arrive (if waitForOTP is true)

    const approvalUrl = `${c.env.DASHBOARD_URL}/approve/${requestId}`;
    const webhookUrl = `wss://${c.env.API_BASE_URL.replace(/^https?:\/\//, '')}/ws/${requestId}`;

    return c.json(
      createApiResponse({
        id: requestId,
        status: OTP_REQUEST_STATUS.PENDING_APPROVAL,
        approvalUrl,
        webhookUrl,
        expiresAt: toISOString(expiresAt),
      }),
      HTTP_STATUS.ACCEPTED
    );
  }
);

/**
 * GET /api/v1/otp/:id
 * Get the current status of an OTP request.
 */
permissions.get('/:id', async (c) => {
  const agent = c.get('agent');
  const id = c.req.param('id');

  // TODO: Implement actual database lookup

  return c.json(
    createApiResponse({
      id,
      status: OTP_REQUEST_STATUS.PENDING_APPROVAL,
      expiresAt: toISOString(calculateExpiresAt(300)),
    })
  );
});

/**
 * POST /api/v1/otp/:id/consume
 * Consume and retrieve the encrypted OTP.
 */
permissions.post('/:id/consume', async (c) => {
  const agent = c.get('agent');
  const id = c.req.param('id');

  // TODO: Implement actual OTP consumption
  // 1. Verify request belongs to agent
  // 2. Check status is otp_received
  // 3. Return encrypted payload
  // 4. Delete OTP from storage

  throw new HTTPException(HTTP_STATUS.NOT_IMPLEMENTED, {
    message: 'OTP consumption not yet implemented',
  });
});

/**
 * DELETE /api/v1/otp/:id
 * Cancel a pending OTP request.
 */
permissions.delete('/:id', async (c) => {
  const agent = c.get('agent');
  const db = c.get('db');
  const id = c.req.param('id');

  const auditService = createAuditService(db);

  // Log the cancellation
  await auditService.log({
    userId: agent.userId,
    agentId: agent.id,
    permissionRequestId: id,
    eventType: AUDIT_EVENT_TYPE.OTP_CANCEL,
    details: {
      reason: 'Cancelled by agent',
    },
  });

  // TODO: Implement actual cancellation in database

  return c.body(null, HTTP_STATUS.NO_CONTENT);
});

export { permissions };
