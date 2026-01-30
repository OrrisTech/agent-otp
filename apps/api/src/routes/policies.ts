/**
 * Policy management routes.
 *
 * NOTE: Policies have been removed in the OTP Relay pivot.
 * This file is kept as a placeholder for future auto-approval rules.
 */

import { Hono } from 'hono';
import type { Env } from '../lib/env';
import type { AuthContext } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { createApiResponse } from '../lib/utils';

const policies = new Hono<{
  Bindings: Env;
  Variables: AuthContext;
}>();

// Apply authentication to all routes
policies.use('*', authMiddleware);

/**
 * GET /api/v1/policies
 * List all policies (placeholder - returns empty list).
 */
policies.get('/', async (c) => {
  return c.json(
    createApiResponse({
      policies: [],
      message: 'Policy management has been deprecated in the OTP Relay version',
    })
  );
});

export { policies };
