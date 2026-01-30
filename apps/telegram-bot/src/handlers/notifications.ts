import { Bot, InlineKeyboard } from 'grammy';
import type { BotContext, OTPRequestWebhookPayload } from '../types.js';
import { encodeCallbackData } from '../types.js';

/**
 * Send OTP request notification to a Telegram user
 */
export async function sendOTPRequestNotification(
  bot: Bot<BotContext>,
  payload: OTPRequestWebhookPayload
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { data, telegramUserId } = payload;

  // Build the notification message
  const message = buildNotificationMessage(data);

  // Build inline keyboard with approve/deny buttons
  const keyboard = new InlineKeyboard()
    .text('✅ Approve', encodeCallbackData({ action: 'approve', requestId: data.requestId }))
    .text('❌ Deny', encodeCallbackData({ action: 'deny', requestId: data.requestId }));

  try {
    const sent = await bot.api.sendMessage(telegramUserId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });

    return { success: true, messageId: sent.message_id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to send notification to ${telegramUserId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Build the notification message text
 */
function buildNotificationMessage(data: OTPRequestWebhookPayload['data']): string {
  const lines: string[] = [
    `🔔 *OTP Request*`,
    ``,
    `An AI agent is requesting access to a verification code.`,
    ``,
    `*Agent:* ${escapeMarkdown(data.agentName)}`,
    `*Reason:* ${escapeMarkdown(data.reason)}`,
  ];

  if (data.expectedSender) {
    lines.push(`*Expected From:* ${escapeMarkdown(data.expectedSender)}`);
  }

  if (data.filter?.sources?.length) {
    const sources = data.filter.sources.map(s => {
      switch (s) {
        case 'sms': return '📱 SMS';
        case 'email': return '📧 Email';
        case 'whatsapp': return '💬 WhatsApp';
        default: return s;
      }
    }).join(', ');
    lines.push(`*Source:* ${sources}`);
  }

  if (data.filter?.senderPattern) {
    lines.push(`*Sender Pattern:* \`${escapeMarkdown(data.filter.senderPattern)}\``);
  }

  // Calculate time remaining
  const expiresAt = new Date(data.expiresAt);
  const now = new Date();
  const secondsRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
  const minutesRemaining = Math.floor(secondsRemaining / 60);

  lines.push(``);
  lines.push(`⏱️ *Expires in:* ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`);
  lines.push(``);
  lines.push(`_Request ID: \`${data.requestId}\`_`);

  return lines.join('\n');
}

/**
 * Send notification that an OTP request has expired
 */
export async function sendExpiredNotification(
  bot: Bot<BotContext>,
  telegramUserId: number,
  requestId: string,
  originalMessageId?: number
): Promise<void> {
  const message =
    `⏰ *OTP Request Expired*\n\n` +
    `Request ID: \`${requestId}\`\n\n` +
    `This request has expired and can no longer be approved.`;

  if (originalMessageId) {
    try {
      // Try to update the original message
      await bot.api.editMessageText(telegramUserId, originalMessageId, message, {
        parse_mode: 'Markdown',
      });
      return;
    } catch {
      // If edit fails, send a new message
    }
  }

  await bot.api.sendMessage(telegramUserId, message, {
    parse_mode: 'Markdown',
  });
}

/**
 * Send notification that an OTP request was cancelled
 */
export async function sendCancelledNotification(
  bot: Bot<BotContext>,
  telegramUserId: number,
  requestId: string,
  originalMessageId?: number
): Promise<void> {
  const message =
    `🚫 *OTP Request Cancelled*\n\n` +
    `Request ID: \`${requestId}\`\n\n` +
    `This request was cancelled by the agent.`;

  if (originalMessageId) {
    try {
      await bot.api.editMessageText(telegramUserId, originalMessageId, message, {
        parse_mode: 'Markdown',
      });
      return;
    } catch {
      // If edit fails, send a new message
    }
  }

  await bot.api.sendMessage(telegramUserId, message, {
    parse_mode: 'Markdown',
  });
}

/**
 * Escape special Markdown characters
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
