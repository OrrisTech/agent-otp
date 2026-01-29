/**
 * Notification service for sending approval requests via Telegram and other channels.
 */

import type { Env } from '../lib/env';
import type { TelegramApprovalRequest } from '@orrisai/agent-otp-shared';

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Notification service for multi-channel notifications.
 */
export class NotificationService {
  private telegramBotToken?: string;
  private dashboardUrl: string;

  constructor(env: Env) {
    this.telegramBotToken = env.TELEGRAM_BOT_TOKEN;
    this.dashboardUrl = env.DASHBOARD_URL;
  }

  /**
   * Sends a Telegram approval request to a user.
   */
  async sendTelegramApproval(
    chatId: number,
    request: TelegramApprovalRequest
  ): Promise<NotificationResult> {
    if (!this.telegramBotToken) {
      return {
        success: false,
        error: 'Telegram bot token not configured',
      };
    }

    const expiresAt = new Date(request.expiresAt);
    const expiresInMinutes = Math.max(
      0,
      Math.floor((expiresAt.getTime() - Date.now()) / 60000)
    );

    // Build approval URL
    const approvalUrl = `${this.dashboardUrl}/approve/${request.permissionRequestId}`;

    // Format the message
    const message = this.formatTelegramMessage(request, expiresInMinutes);

    // Build inline keyboard
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: '✅ Approve',
            callback_data: `approve:${request.permissionRequestId}`,
          },
          {
            text: '❌ Deny',
            callback_data: `deny:${request.permissionRequestId}`,
          },
        ],
        [
          {
            text: 'ℹ️ View Details',
            url: approvalUrl,
          },
        ],
      ],
    };

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
            reply_markup: inlineKeyboard,
          }),
        }
      );

      const result = await response.json() as {
        ok: boolean;
        result?: { message_id: number };
        description?: string;
      };

      if (!result.ok) {
        return {
          success: false,
          error: result.description ?? 'Unknown Telegram error',
        };
      }

      return {
        success: true,
        messageId: result.result?.message_id.toString(),
      };
    } catch (error) {
      console.error('Telegram notification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Updates a Telegram message after approval/denial.
   */
  async updateTelegramMessage(
    chatId: number,
    messageId: string,
    approved: boolean,
    reason?: string
  ): Promise<NotificationResult> {
    if (!this.telegramBotToken) {
      return {
        success: false,
        error: 'Telegram bot token not configured',
      };
    }

    const status = approved ? '✅ APPROVED' : '❌ DENIED';
    const message = `${status}\n\n${reason ? `Reason: ${reason}` : 'Decision recorded.'}`;

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.telegramBotToken}/editMessageText`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: parseInt(messageId, 10),
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );

      const result = await response.json() as { ok: boolean; description?: string };

      if (!result.ok) {
        return {
          success: false,
          error: result.description ?? 'Unknown Telegram error',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Telegram update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Formats a Telegram message for approval request.
   */
  private formatTelegramMessage(
    request: TelegramApprovalRequest,
    expiresInMinutes: number
  ): string {
    const scopeStr = Object.entries(request.scope)
      .map(([k, v]) => `  • ${k}: ${JSON.stringify(v)}`)
      .join('\n');

    const contextStr = Object.entries(request.context)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `  • ${k}: ${v}`)
      .join('\n');

    let message = `🔐 <b>Permission Request</b>\n\n`;
    message += `<b>Agent:</b> ${this.escapeHtml(request.agentName)}\n`;
    message += `<b>Action:</b> ${this.escapeHtml(request.action)}\n`;

    if (request.resource) {
      message += `<b>Resource:</b> ${this.escapeHtml(request.resource)}\n`;
    }

    if (scopeStr) {
      message += `\n<b>Scope:</b>\n${this.escapeHtml(scopeStr)}\n`;
    }

    if (contextStr) {
      message += `\n<b>Context:</b>\n${this.escapeHtml(contextStr)}\n`;
    }

    message += `\n⏰ Expires in: ${expiresInMinutes} minute${expiresInMinutes !== 1 ? 's' : ''}`;

    return message;
  }

  /**
   * Escapes HTML special characters for Telegram messages.
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

/**
 * Creates a new notification service instance.
 */
export function createNotificationService(env: Env): NotificationService {
  return new NotificationService(env);
}
