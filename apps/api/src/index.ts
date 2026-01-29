/**
 * Agent OTP API - Main entry point
 *
 * A lightweight OTP (One-Time Permission) service for AI Agents,
 * enabling scoped, ephemeral, and human-approved access to sensitive operations.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './lib/env';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { permissions } from './routes/permissions';
import { agents } from './routes/agents';
import { policies } from './routes/policies';
import { audit } from './routes/audit';
import { webhooks } from './routes/webhooks';
import { createApiResponse } from './lib/utils';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow requests from dashboard and localhost for development
      if (!origin) return '*';
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return origin;
      }
      if (origin.includes('agentotp.com')) {
        return origin;
      }
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-User-ID'],
    exposeHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    maxAge: 86400,
    credentials: true,
  })
);

// Global rate limiting (more permissive than per-agent limits)
app.use('/api/*', rateLimitMiddleware({ maxRequests: 1000, windowMs: 60000 }));

// Health check endpoint
app.get('/health', (c) => {
  return c.json(
    createApiResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    })
  );
});

// API version info
app.get('/api', (c) => {
  return c.json(
    createApiResponse({
      name: 'Agent OTP API',
      version: 'v1',
      description:
        'One-Time Permission service for AI Agents - enabling scoped, ephemeral, and human-approved access to sensitive operations.',
      documentation: 'https://docs.agentotp.com',
      endpoints: {
        permissions: '/api/v1/permissions',
        agents: '/api/v1/agents',
        policies: '/api/v1/policies',
        audit: '/api/v1/audit',
        webhooks: '/api/v1/webhooks',
      },
    })
  );
});

// Mount API routes
app.route('/api/v1/permissions', permissions);
app.route('/api/v1/agents', agents);
app.route('/api/v1/policies', policies);
app.route('/api/v1/audit', audit);
app.route('/api/v1/webhooks', webhooks);

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;
