import type { BotContext } from '../types.js';
import { apiClient } from '../services/api.js';

/**
 * Handle /start command
 * Welcome message and link account if token provided
 */
export async function handleStart(ctx: BotContext): Promise<void> {
  const startParam = ctx.match as string | undefined;

  // Check if this is a deep link with a link token
  if (startParam?.startsWith('link_')) {
    const linkToken = startParam.replace('link_', '');
    await handleLinkAccount(ctx, linkToken);
    return;
  }

  // Check if user is already linked
  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) {
    await ctx.reply('❌ Could not identify your Telegram account.');
    return;
  }

  const linkStatus = await apiClient.checkTelegramLink(telegramUserId);

  if (linkStatus.linked) {
    await ctx.reply(
      `✅ *Welcome back to Agent OTP!*\n\n` +
        `Your Telegram account is linked and ready to receive OTP approval requests.\n\n` +
        `*Commands:*\n` +
        `/status - Check your link status\n` +
        `/help - Get help\n`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply(
      `👋 *Welcome to Agent OTP!*\n\n` +
        `I'll notify you when your AI agents request OTP access.\n\n` +
        `*To get started:*\n` +
        `1. Go to your Agent OTP dashboard\n` +
        `2. Click "Link Telegram"\n` +
        `3. Scan the QR code or click the link\n\n` +
        `Once linked, you'll receive approval requests here.`,
      { parse_mode: 'Markdown' }
    );
  }
}

/**
 * Handle account linking via deep link
 */
async function handleLinkAccount(
  ctx: BotContext,
  linkToken: string
): Promise<void> {
  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) {
    await ctx.reply('❌ Could not identify your Telegram account.');
    return;
  }

  try {
    const result = await apiClient.linkTelegramUser(telegramUserId, linkToken);

    if (result.success) {
      await ctx.reply(
        `✅ *Account Linked Successfully!*\n\n` +
          `Your Telegram account is now connected to Agent OTP.\n\n` +
          `You'll receive notifications here when your AI agents request OTP access.`,
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.reply(
        `❌ *Link Failed*\n\n${result.message}\n\n` +
          `Please try generating a new link from the dashboard.`,
        { parse_mode: 'Markdown' }
      );
    }
  } catch (error) {
    console.error('Link account error:', error);
    await ctx.reply(
      `❌ *Link Failed*\n\n` +
        `Something went wrong. Please try again or contact support.`,
      { parse_mode: 'Markdown' }
    );
  }
}

/**
 * Handle /status command
 * Show current link status and pending requests
 */
export async function handleStatus(ctx: BotContext): Promise<void> {
  const telegramUserId = ctx.from?.id;
  if (!telegramUserId) {
    await ctx.reply('❌ Could not identify your Telegram account.');
    return;
  }

  const linkStatus = await apiClient.checkTelegramLink(telegramUserId);

  if (linkStatus.linked) {
    await ctx.reply(
      `✅ *Account Status: Linked*\n\n` +
        `Your Telegram is connected to Agent OTP.\n` +
        `You'll receive OTP approval requests here.`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply(
      `❌ *Account Status: Not Linked*\n\n` +
        `Your Telegram is not connected to Agent OTP.\n\n` +
        `Link your account from the Agent OTP dashboard.`,
      { parse_mode: 'Markdown' }
    );
  }
}

/**
 * Handle /help command
 */
export async function handleHelp(ctx: BotContext): Promise<void> {
  await ctx.reply(
    `🤖 *Agent OTP Bot Help*\n\n` +
      `This bot notifies you when your AI agents request OTP access.\n\n` +
      `*How it works:*\n` +
      `1. Your AI agent requests an OTP\n` +
      `2. You receive a notification here\n` +
      `3. Approve or deny the request\n` +
      `4. If approved, the agent receives the OTP\n\n` +
      `*Commands:*\n` +
      `/start - Start the bot\n` +
      `/status - Check your link status\n` +
      `/help - Show this help message\n\n` +
      `*Security:*\n` +
      `• OTPs are end-to-end encrypted\n` +
      `• Each OTP can only be read once\n` +
      `• You control every OTP access\n\n` +
      `Need help? Visit agentotp.com/docs`,
    { parse_mode: 'Markdown' }
  );
}
