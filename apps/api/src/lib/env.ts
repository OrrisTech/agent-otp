/**
 * Environment configuration and type definitions for Cloudflare Workers.
 */

export interface Env {
  // Database (Supabase)
  DATABASE_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Redis (Upstash)
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // JWT Secret for token signing
  JWT_SECRET: string;

  // Telegram Bot
  TELEGRAM_BOT_TOKEN?: string;

  // API Configuration
  API_BASE_URL: string;
  DASHBOARD_URL: string;

  // Rate Limiting
  RATE_LIMIT_REQUESTS?: string;
  RATE_LIMIT_WINDOW_MS?: string;
}

/**
 * Get environment variable with optional default value.
 */
export function getEnvVar(
  env: Env,
  key: keyof Env,
  defaultValue?: string
): string {
  const value = env[key];
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as string;
}

/**
 * Get optional environment variable.
 */
export function getOptionalEnvVar(
  env: Env,
  key: keyof Env
): string | undefined {
  const value = env[key];
  return value === undefined || value === '' ? undefined : (value as string);
}

/**
 * Get numeric environment variable with default value.
 */
export function getEnvVarAsNumber(
  env: Env,
  key: keyof Env,
  defaultValue: number
): number {
  const value = env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  const parsed = parseInt(value as string, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
