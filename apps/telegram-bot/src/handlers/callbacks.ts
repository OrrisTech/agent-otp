import type { BotContext } from '../types.js';
import { decodeCallbackData } from '../types.js';
import { apiClient } from '../services/api.js';

/**
 * Handle callback queries from inline buttons (approve/deny)
 */
export async function handleApprovalCallback(ctx: BotContext): Promise<void> {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) {
    await ctx.answerCallbackQuery({ text: 'Invalid request' });
    return;
  }

  const parsed = decodeCallbackData(callbackData);
  if (!parsed) {
    await ctx.answerCallbackQuery({ text: 'Invalid callback data' });
    return;
  }

  const { action, requestId } = parsed;

  try {
    if (action === 'approve') {
      await handleApprove(ctx, requestId);
    } else {
      await handleDeny(ctx, requestId);
    }
  } catch (error) {
    console.error(`Error handling ${action}:`, error);
    await ctx.answerCallbackQuery({
      text: '❌ Something went wrong. Please try again.',
      show_alert: true,
    });
  }
}

/**
 * Handle approve action
 */
async function handleApprove(ctx: BotContext, requestId: string): Promise<void> {
  // Show loading state
  await ctx.answerCallbackQuery({ text: '⏳ Approving...' });

  try {
    const result = await apiClient.approveRequest(requestId);

    if (result.success) {
      // Update the message to show approval status
      await ctx.editMessageText(
        getApprovedMessage(requestId),
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.answerCallbackQuery({
        text: `❌ ${result.message}`,
        show_alert: true,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if request already expired or was handled
    if (errorMessage.includes('expired') || errorMessage.includes('not found')) {
      await ctx.editMessageText(
        getExpiredMessage(requestId),
        { parse_mode: 'Markdown' }
      );
    } else if (errorMessage.includes('already')) {
      await ctx.editMessageText(
        getAlreadyHandledMessage(requestId),
        { parse_mode: 'Markdown' }
      );
    } else {
      throw error;
    }
  }
}

/**
 * Handle deny action
 */
async function handleDeny(ctx: BotContext, requestId: string): Promise<void> {
  // Show loading state
  await ctx.answerCallbackQuery({ text: '⏳ Denying...' });

  try {
    const result = await apiClient.denyRequest(requestId);

    if (result.success) {
      // Update the message to show denial status
      await ctx.editMessageText(
        getDeniedMessage(requestId),
        { parse_mode: 'Markdown' }
      );
    } else {
      await ctx.answerCallbackQuery({
        text: `❌ ${result.message}`,
        show_alert: true,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if request already expired or was handled
    if (errorMessage.includes('expired') || errorMessage.includes('not found')) {
      await ctx.editMessageText(
        getExpiredMessage(requestId),
        { parse_mode: 'Markdown' }
      );
    } else if (errorMessage.includes('already')) {
      await ctx.editMessageText(
        getAlreadyHandledMessage(requestId),
        { parse_mode: 'Markdown' }
      );
    } else {
      throw error;
    }
  }
}

/**
 * Get message text for approved request
 */
function getApprovedMessage(requestId: string): string {
  return (
    `✅ *OTP Request Approved*\n\n` +
    `Request ID: \`${requestId}\`\n\n` +
    `The agent can now receive the OTP when it arrives.`
  );
}

/**
 * Get message text for denied request
 */
function getDeniedMessage(requestId: string): string {
  return (
    `❌ *OTP Request Denied*\n\n` +
    `Request ID: \`${requestId}\`\n\n` +
    `The agent will not receive this OTP.`
  );
}

/**
 * Get message text for expired request
 */
function getExpiredMessage(requestId: string): string {
  return (
    `⏰ *OTP Request Expired*\n\n` +
    `Request ID: \`${requestId}\`\n\n` +
    `This request has expired and can no longer be approved.`
  );
}

/**
 * Get message text for already handled request
 */
function getAlreadyHandledMessage(requestId: string): string {
  return (
    `ℹ️ *Request Already Handled*\n\n` +
    `Request ID: \`${requestId}\`\n\n` +
    `This request has already been processed.`
  );
}
