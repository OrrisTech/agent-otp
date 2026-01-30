/**
 * Webhook Server for Email Integration
 *
 * Receives notifications from Agent OTP API about:
 * - New OTP requests that need email monitoring
 * - Cancelled or expired requests
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { config } from './config.js';
import type { GmailWatcher, PendingOTPRequest } from './services/gmail-watcher.js';

/**
 * Webhook payload from Agent OTP API
 */
interface WebhookPayload {
  event:
    | 'otp_request.approved' // Start monitoring for this request
    | 'otp_request.cancelled'
    | 'otp_request.expired'
    | 'otp_request.consumed';
  data: {
    requestId: string;
    publicKey?: string;
    expectedSender?: string;
    filter?: {
      sources?: string[];
      senderPattern?: string;
    };
    createdAt?: string;
    expiresAt?: string;
  };
}

/**
 * Create the webhook server
 */
export function createWebhookServer(gmailWatcher: GmailWatcher | null): Hono {
  const app = new Hono();

  // Health check
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      gmailConnected: gmailWatcher !== null,
    });
  });

  // Agent OTP API webhook
  app.post('/api/webhook', async (c) => {
    // Verify webhook secret
    const signature = c.req.header('X-Webhook-Signature');
    if (signature !== config.WEBHOOK_SECRET) {
      console.warn('Invalid webhook signature');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const payload = await c.req.json<WebhookPayload>();

      console.log(`Received webhook: ${payload.event} for request ${payload.data.requestId}`);

      switch (payload.event) {
        case 'otp_request.approved':
          await handleRequestApproved(gmailWatcher, payload);
          break;

        case 'otp_request.cancelled':
        case 'otp_request.expired':
        case 'otp_request.consumed':
          handleRequestRemoved(gmailWatcher, payload.data.requestId);
          break;

        default:
          console.warn(`Unknown webhook event: ${payload.event}`);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  return app;
}

/**
 * Handle approved OTP request - start monitoring
 */
async function handleRequestApproved(
  gmailWatcher: GmailWatcher | null,
  payload: WebhookPayload
): Promise<void> {
  const { data } = payload;

  // Check if this request needs email monitoring
  const sources = data.filter?.sources ?? ['email'];
  if (!sources.includes('email')) {
    console.log(`Request ${data.requestId} does not need email monitoring`);
    return;
  }

  if (!gmailWatcher) {
    console.warn(`Gmail not connected, cannot monitor request ${data.requestId}`);
    return;
  }

  if (!data.publicKey) {
    console.warn(`Request ${data.requestId} missing public key`);
    return;
  }

  const pendingRequest: PendingOTPRequest = {
    requestId: data.requestId,
    publicKey: data.publicKey,
    expectedSender: data.expectedSender,
    senderPattern: data.filter?.senderPattern,
    sources,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 5 * 60 * 1000),
  };

  gmailWatcher.addPendingRequest(pendingRequest);
}

/**
 * Handle removed request - stop monitoring
 */
function handleRequestRemoved(
  gmailWatcher: GmailWatcher | null,
  requestId: string
): void {
  if (gmailWatcher) {
    gmailWatcher.removePendingRequest(requestId);
  }
}

/**
 * Start the webhook server
 */
export function startWebhookServer(app: Hono): void {
  const port = config.WEBHOOK_PORT;

  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`🚀 Email integration webhook server running on port ${info.port}`);
      console.log(`   API webhook: POST /api/webhook`);
      console.log(`   Health check: GET /health`);
    }
  );
}
