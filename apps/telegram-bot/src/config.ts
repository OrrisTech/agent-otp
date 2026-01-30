import { z } from 'zod';

/**
 * Environment configuration schema with validation
 */
const envSchema = z.object({
  // Telegram Bot Token from @BotFather
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),

  // Agent OTP API configuration
  AGENT_OTP_API_URL: z.string().url().default('http://localhost:8787'),
  AGENT_OTP_API_KEY: z.string().min(1, 'AGENT_OTP_API_KEY is required'),

  // Webhook configuration (for receiving OTP request notifications)
  WEBHOOK_SECRET: z.string().min(16, 'WEBHOOK_SECRET must be at least 16 characters'),
  WEBHOOK_PORT: z.coerce.number().default(3001),

  // Optional: Set webhook URL if using webhook mode instead of polling
  WEBHOOK_URL: z.string().url().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Config = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables
 */
export function loadConfig(): Config {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const error of result.error.errors) {
      console.error(`   ${error.path.join('.')}: ${error.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();
