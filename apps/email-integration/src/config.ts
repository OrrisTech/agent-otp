import { z } from 'zod';

/**
 * Environment configuration schema
 */
const envSchema = z.object({
  // Agent OTP API configuration
  AGENT_OTP_API_URL: z.string().url().default('http://localhost:8787'),
  AGENT_OTP_API_KEY: z.string().min(1, 'AGENT_OTP_API_KEY is required'),

  // Webhook configuration
  WEBHOOK_SECRET: z.string().min(16, 'WEBHOOK_SECRET must be at least 16 characters'),
  WEBHOOK_PORT: z.coerce.number().default(3002),

  // Gmail OAuth configuration (optional, for Gmail integration)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // IMAP configuration (optional, for generic IMAP)
  IMAP_HOST: z.string().optional(),
  IMAP_PORT: z.coerce.number().default(993),
  IMAP_USER: z.string().optional(),
  IMAP_PASSWORD: z.string().optional(),
  IMAP_TLS: z.coerce.boolean().default(true),

  // Polling interval in milliseconds
  POLL_INTERVAL_MS: z.coerce.number().default(10000), // 10 seconds

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
