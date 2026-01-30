/**
 * Webhook routes for receiving OTPs from external sources.
 *
 * These routes handle incoming OTPs from:
 * - Android SMS app
 * - Email integrations (Gmail, IMAP)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../lib/env';
import { createDbClient } from '../lib/db';
import { createRedisClient } from '../lib/redis';
import { createAuditService } from '../services/audit-service';
import { createApiResponse, toISOString } from '../lib/utils';
import {
  OTP_REQUEST_STATUS,
  OTP_SOURCE,
  AUDIT_EVENT_TYPE,
  HTTP_STATUS,
} from '@orrisai/agent-otp-shared';

const webhooks = new Hono<{
  Bindings: Env;
}>();

/**
 * Schema for incoming OTP from capture sources.
 */
const incomingOTPSchema = z.object({
  // The OTP request ID this OTP is for
  requestId: z.string(),
  // The OTP code (encrypted with agent's public key)
  encryptedPayload: z.string(),
  // Source of the OTP
  source: z.enum([OTP_SOURCE.SMS, OTP_SOURCE.EMAIL, OTP_SOURCE.WHATSAPP]),
  // Sender information
  sender: z.string().optional(),
  // Subject (for email)
  subject: z.string().optional(),
  // Device ID that captured the OTP
  deviceId: z.string().optional(),
  // Timestamp when OTP was received
  receivedAt: z.string().datetime().optional(),
});

/**
 * POST /api/v1/webhooks/otp
 * Receive an OTP from a capture source (Android app, email integration).
 */
webhooks.post(
  '/otp',
  zValidator('json', incomingOTPSchema),
  async (c) => {
    const db = createDbClient(c.env);
    const redis = createRedisClient(c.env);
    const body = c.req.valid('json');
    const auditService = createAuditService(db);

    // TODO: Implement full OTP reception flow
    // 1. Verify the request exists and is in 'approved' status
    // 2. Verify the OTP matches the filter criteria
    // 3. Store the encrypted payload
    // 4. Update status to 'otp_received'
    // 5. Notify the agent via WebSocket

    // Log the OTP reception
    await auditService.log({
      userId: 'system',
      permissionRequestId: body.requestId,
      eventType: AUDIT_EVENT_TYPE.OTP_RECEIVE,
      details: {
        source: body.source,
        sender: body.sender,
        deviceId: body.deviceId,
        receivedAt: body.receivedAt ?? toISOString(new Date()),
      },
    });

    return c.json(
      createApiResponse({
        status: OTP_REQUEST_STATUS.OTP_RECEIVED,
        message: 'OTP received and stored',
      }),
      HTTP_STATUS.OK
    );
  }
);

/**
 * POST /api/v1/webhooks/telegram
 * Telegram bot webhook for approval decisions.
 */
webhooks.post('/telegram', async (c) => {
  // TODO: Implement Telegram bot webhook
  // 1. Parse Telegram update
  // 2. Handle callback queries for approve/deny
  // 3. Update OTP request status

  return c.json({ ok: true });
});

export { webhooks };
