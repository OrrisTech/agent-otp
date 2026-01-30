import { Bot, session } from 'grammy';
import type { BotContext, SessionData } from './types.js';
import { config } from './config.js';
import { handleStart, handleStatus, handleHelp } from './handlers/commands.js';
import { handleApprovalCallback } from './handlers/callbacks.js';

/**
 * Create and configure the Telegram bot
 */
export function createBot(): Bot<BotContext> {
  const bot = new Bot<BotContext>(config.TELEGRAM_BOT_TOKEN);

  // Initialize session middleware
  bot.use(
    session({
      initial: (): SessionData => ({
        pendingRequests: new Map(),
      }),
    })
  );

  // Error handler
  bot.catch((err) => {
    console.error('Bot error:', err);
  });

  // Register command handlers
  bot.command('start', handleStart);
  bot.command('status', handleStatus);
  bot.command('help', handleHelp);

  // Register callback query handler for approve/deny buttons
  bot.on('callback_query:data', handleApprovalCallback);

  return bot;
}

/**
 * Start the bot in polling mode (for development)
 */
export async function startPolling(bot: Bot<BotContext>): Promise<void> {
  // Delete any existing webhook before starting polling
  await bot.api.deleteWebhook();

  console.log('🤖 Starting bot in polling mode...');

  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} is running!`);
    },
  });
}

/**
 * Set up webhook mode (for production)
 */
export async function setupWebhook(
  bot: Bot<BotContext>,
  webhookUrl: string
): Promise<void> {
  console.log(`🔗 Setting up webhook: ${webhookUrl}`);

  await bot.api.setWebhook(webhookUrl, {
    secret_token: config.WEBHOOK_SECRET,
  });

  console.log('✅ Webhook configured successfully');
}
