import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Bot, webhookCallback } from 'grammy';
import type { BotContext, OTPRequestWebhookPayload } from './types.js';
import { config } from './config.js';
import {
  sendOTPRequestNotification,
  sendExpiredNotification,
  sendCancelledNotification,
} from './handlers/notifications.js';

/**
 * Create the webhook server
 * Handles both Telegram webhook callbacks and Agent OTP API notifications
 */
export function createWebhookServer(bot: Bot<BotContext>): Hono {
  const app = new Hono();

  // Health check endpoint
  app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Telegram webhook endpoint
  // This receives updates from Telegram (messages, callback queries, etc.)
  app.post('/telegram/webhook', async (c) => {
    const secretToken = c.req.header('X-Telegram-Bot-Api-Secret-Token');

    if (secretToken !== config.WEBHOOK_SECRET) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const handler = webhookCallback(bot, 'hono');
      return await handler(c);
    } catch (error) {
      console.error('Telegram webhook error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  // Agent OTP API webhook endpoint
  // This receives notifications about new OTP requests
  app.post('/api/webhook', async (c) => {
    // Verify webhook secret
    const signature = c.req.header('X-Webhook-Signature');
    if (signature !== config.WEBHOOK_SECRET) {
      console.warn('Invalid webhook signature');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const payload = await c.req.json<OTPRequestWebhookPayload>();

      console.log(`Received webhook: ${payload.event} for request ${payload.data.requestId}`);

      switch (payload.event) {
        case 'otp_request.created':
          await handleOTPRequestCreated(bot, payload);
          break;

        case 'otp_request.expired':
          await handleOTPRequestExpired(bot, payload);
          break;

        case 'otp_request.cancelled':
          await handleOTPRequestCancelled(bot, payload);
          break;

        default:
          console.warn(`Unknown webhook event: ${payload.event}`);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error('API webhook error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  });

  return app;
}

/**
 * Handle new OTP request created event
 */
async function handleOTPRequestCreated(
  bot: Bot<BotContext>,
  payload: OTPRequestWebhookPayload
): Promise<void> {
  const result = await sendOTPRequestNotification(bot, payload);

  if (result.success) {
    console.log(
      `Notification sent for request ${payload.data.requestId} ` +
        `to user ${payload.telegramUserId} (message: ${result.messageId})`
    );
  } else {
    console.error(
      `Failed to send notification for request ${payload.data.requestId}: ${result.error}`
    );
  }
}

/**
 * Handle OTP request expired event
 */
async function handleOTPRequestExpired(
  bot: Bot<BotContext>,
  payload: OTPRequestWebhookPayload
): Promise<void> {
  await sendExpiredNotification(
    bot,
    payload.telegramUserId,
    payload.data.requestId
  );
}

/**
 * Handle OTP request cancelled event
 */
async function handleOTPRequestCancelled(
  bot: Bot<BotContext>,
  payload: OTPRequestWebhookPayload
): Promise<void> {
  await sendCancelledNotification(
    bot,
    payload.telegramUserId,
    payload.data.requestId
  );
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
      console.log(`🚀 Webhook server running on port ${info.port}`);
      console.log(`   Telegram webhook: POST /telegram/webhook`);
      console.log(`   API webhook: POST /api/webhook`);
      console.log(`   Health check: GET /health`);
    }
  );
}
