import { createBot, startPolling, setupWebhook } from './bot.js';
import { createWebhookServer, startWebhookServer } from './webhook-server.js';
import { config } from './config.js';

/**
 * Main entry point for the Agent OTP Telegram Bot
 *
 * The bot can run in two modes:
 * 1. Polling mode (development): Bot polls Telegram for updates
 * 2. Webhook mode (production): Telegram sends updates to our webhook
 *
 * Additionally, the bot receives webhooks from the Agent OTP API
 * about new OTP requests that need user approval.
 */
async function main(): Promise<void> {
  console.log('🤖 Agent OTP Telegram Bot');
  console.log(`   Environment: ${config.NODE_ENV}`);

  // Create the bot instance
  const bot = createBot();

  // Create the webhook server (for Agent OTP API notifications)
  const app = createWebhookServer(bot);

  // Start the webhook server
  startWebhookServer(app);

  // Start the bot
  if (config.WEBHOOK_URL) {
    // Production: Use webhook mode for Telegram
    const telegramWebhookUrl = `${config.WEBHOOK_URL}/telegram/webhook`;
    await setupWebhook(bot, telegramWebhookUrl);
    console.log('✅ Bot running in webhook mode');
  } else {
    // Development: Use polling mode for Telegram
    await startPolling(bot);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

// Start the bot
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
