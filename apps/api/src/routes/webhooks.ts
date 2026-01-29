/**
 * Webhook routes for external service integrations (e.g., Telegram).
 */

import { Hono } from 'hono';
import type { Env } from '../lib/env';
import { createDbClient, type PermissionRequestRow, type UserRow, type TokenRow } from '../lib/db';
import { createRedisClient } from '../lib/redis';
import { createTokenService } from '../services/token-service';
import { createAuditService } from '../services/audit-service';
import { createNotificationService } from '../services/notification-service';
import { toISOString, isExpired } from '../lib/utils';
import {
  PERMISSION_STATUS,
  AUDIT_EVENT_TYPE,
  HTTP_STATUS,
} from '@orrisai/agent-otp-shared';

const webhooks = new Hono<{ Bindings: Env }>();

interface TelegramUpdate {
  update_id: number;
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    message: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data: string;
  };
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
    };
    text?: string;
  };
}

/**
 * POST /api/v1/webhooks/telegram
 * Telegram bot webhook endpoint.
 */
webhooks.post('/telegram', async (c) => {
  const botToken = c.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return c.json({ error: 'Telegram not configured' }, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  const update: TelegramUpdate = await c.req.json();
  const db = createDbClient(c.env);
  const redis = createRedisClient(c.env);
  const tokenService = createTokenService(db, redis);
  const auditService = createAuditService(db);
  const notificationService = createNotificationService(c.env);

  // Handle callback query (button press)
  if (update.callback_query) {
    const callbackQuery = update.callback_query;
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id.toString();

    // Answer callback to remove loading state
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    });

    // Parse action:permissionId format
    const [action, permissionRequestId] = data.split(':');

    if (!permissionRequestId || (action !== 'approve' && action !== 'deny')) {
      return c.json({ ok: true });
    }

    // Verify the user is linked to this permission's owner
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();

    const userData = user as Pick<UserRow, 'id'> | null;

    if (!userData) {
      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        false,
        'Your Telegram account is not linked. Please link it in the dashboard.'
      );
      return c.json({ ok: true });
    }

    // Get permission request
    const { data: permRequest } = await db
      .from('permission_requests')
      .select('*, agents!inner(user_id, name)')
      .eq('id', permissionRequestId)
      .single();

    if (!permRequest) {
      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        false,
        'Permission request not found.'
      );
      return c.json({ ok: true });
    }

    const perm = permRequest as PermissionRequestRow & { agents: { user_id: string; name: string } };

    // Verify the user owns this agent
    if (perm.agents.user_id !== userData.id) {
      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        false,
        'You are not authorized to approve this request.'
      );
      return c.json({ ok: true });
    }

    // Check if already decided
    if (perm.status !== PERMISSION_STATUS.PENDING) {
      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        perm.status === PERMISSION_STATUS.APPROVED,
        `This request was already ${perm.status}.`
      );
      return c.json({ ok: true });
    }

    // Check if expired
    if (isExpired(perm.expires_at)) {
      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        false,
        'This request has expired.'
      );
      return c.json({ ok: true });
    }

    const approved = action === 'approve';

    // Update permission request
    await db
      .from('permission_requests')
      .update({
        status: approved ? PERMISSION_STATUS.APPROVED : PERMISSION_STATUS.DENIED,
        decision_reason: `${approved ? 'Approved' : 'Denied'} via Telegram`,
        decided_by: 'user',
        decided_at: toISOString(new Date()),
      })
      .eq('id', permissionRequestId);

    if (approved) {
      // Calculate remaining TTL
      const expiresAt = new Date(perm.expires_at);
      const remainingTtl = Math.max(
        30,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      );

      // Generate token
      await tokenService.createToken({
        permissionRequestId,
        scope: perm.scope,
        ttlSeconds: remainingTtl,
      });

      await auditService.log({
        userId: userData.id,
        agentId: perm.agent_id,
        permissionRequestId,
        eventType: AUDIT_EVENT_TYPE.APPROVE,
        details: {
          decidedBy: 'user',
          channel: 'telegram',
        },
      });

      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        true,
        `Approved for agent: ${perm.agents.name}`
      );
    } else {
      await auditService.log({
        userId: userData.id,
        agentId: perm.agent_id,
        permissionRequestId,
        eventType: AUDIT_EVENT_TYPE.DENY,
        details: {
          decidedBy: 'user',
          channel: 'telegram',
        },
      });

      await notificationService.updateTelegramMessage(
        chatId,
        messageId,
        false,
        `Denied for agent: ${perm.agents.name}`
      );
    }

    return c.json({ ok: true });
  }

  // Handle text messages (commands)
  if (update.message?.text) {
    const text = update.message.text;
    const chatId = update.message.chat.id;

    // Handle /start command with link token
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const linkToken = parts[1];

      if (linkToken) {
        // Find user by link token (stored in Redis temporarily)
        const userIdKey = `telegram_link:${linkToken}`;
        const userId = await redis.get<string>(userIdKey);

        if (userId) {
          // Link the Telegram account
          await db
            .from('users')
            .update({ telegram_chat_id: chatId })
            .eq('id', userId);

          // Remove link token
          await redis.del(userIdKey);

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '✅ Your Telegram account has been linked successfully!\n\nYou will now receive permission approval requests here.',
            }),
          });
        } else {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '❌ Invalid or expired link token. Please generate a new link from the dashboard.',
            }),
          });
        }
      } else {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '👋 Welcome to Agent OTP!\n\nTo link your account, please use the link from your dashboard.',
          }),
        });
      }
    }

    // Handle /status command
    if (text === '/status') {
      const { data: user } = await db
        .from('users')
        .select('id, email')
        .eq('telegram_chat_id', chatId)
        .single();

      const userData = user as Pick<UserRow, 'id' | 'email'> | null;

      if (userData) {
        // Get user's agents first
        const { data: userAgents } = await db
          .from('agents')
          .select('id')
          .eq('user_id', userData.id);

        const agentIds = (userAgents as { id: string }[] | null)?.map(a => a.id) ?? [];

        // Get pending requests count
        const { count } = await db
          .from('permission_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', PERMISSION_STATUS.PENDING)
          .in('agent_id', agentIds);

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📊 Status\n\nLinked to: ${userData.email}\nPending requests: ${count ?? 0}`,
          }),
        });
      } else {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '❌ Your Telegram account is not linked. Please link it from the dashboard.',
          }),
        });
      }
    }

    // Handle /help command
    if (text === '/help') {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 Agent OTP Bot Help\n\nCommands:\n/start - Link your account\n/status - Check your status\n/help - Show this help message\n\nWhen your AI agents request permissions, you'll receive approval requests here. You can approve or deny them with one tap.`,
        }),
      });
    }
  }

  return c.json({ ok: true });
});

export { webhooks };
