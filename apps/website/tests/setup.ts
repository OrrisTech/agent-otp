/**
 * Test setup file for Vitest
 *
 * Configures testing environment with React Testing Library matchers
 * and global mocks for Next.js and external services.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.STRIPE_SECRET_KEY = 'sk_test_xxxxx';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_xxxxx';
process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
process.env.STRIPE_PRICE_PRO_YEARLY = 'price_pro_yearly';
process.env.STRIPE_PRICE_TEAM_MONTHLY = 'price_team_monthly';
process.env.STRIPE_PRICE_TEAM_YEARLY = 'price_team_yearly';
process.env.SENDGRID_API_KEY = 'SG.test_key';
process.env.SENDGRID_FROM_EMAIL = 'test@agentotp.com';

// Global fetch mock
global.fetch = vi.fn();
