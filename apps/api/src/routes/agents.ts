/**
 * Agent management routes (for dashboard users).
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/env';
import { createDbClient, type AgentRow } from '../lib/db';
import { hashApiKey } from '../lib/crypto';
import { generateApiKey, getApiKeyPrefix, createApiResponse } from '../lib/utils';
import { createAuditService } from '../services/audit-service';
import {
  createAgentSchema,
  updateAgentSchema,
  paginationSchema,
} from '@orrisai/agent-otp-shared';
import { AUDIT_EVENT_TYPE, HTTP_STATUS } from '@orrisai/agent-otp-shared';

const agents = new Hono<{ Bindings: Env }>();

// Note: These routes require user authentication (session-based or JWT)
// For MVP, we'll use a simple user ID header - in production, use proper auth

/**
 * Helper to get user ID from request.
 * In production, this would come from session/JWT validation.
 */
function getUserId(c: { req: { header: (name: string) => string | undefined } }): string {
  const userId = c.req.header('X-User-ID');
  if (!userId) {
    throw new HTTPException(HTTP_STATUS.UNAUTHORIZED, {
      message: 'User authentication required',
    });
  }
  return userId;
}

/**
 * GET /api/v1/agents
 * List all agents for the authenticated user.
 */
agents.get(
  '/',
  zValidator('query', paginationSchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const { page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await db
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get agents
    const { data, error } = await db
      .from('agents')
      .select('id, name, description, api_key_prefix, metadata, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to fetch agents',
      });
    }

    const agentList = data as AgentRow[] | null;

    return c.json(
      createApiResponse(
        agentList?.map((agent) => ({
          id: agent.id,
          name: agent.name,
          description: agent.description,
          apiKeyPrefix: agent.api_key_prefix,
          metadata: agent.metadata,
          isActive: agent.is_active,
          createdAt: agent.created_at,
          updatedAt: agent.updated_at,
        })) ?? [],
        { page, limit, total: count ?? 0 }
      )
    );
  }
);

/**
 * POST /api/v1/agents
 * Create a new agent.
 */
agents.post(
  '/',
  zValidator('json', createAgentSchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const body = c.req.valid('json');
    const auditService = createAuditService(db);

    // Generate API key
    const apiKey = generateApiKey();
    const apiKeyPrefix = getApiKeyPrefix(apiKey);
    const apiKeyHash = await hashApiKey(apiKey);

    // Create agent
    const { data: agent, error } = await db
      .from('agents')
      .insert({
        user_id: userId,
        name: body.name,
        description: body.description ?? null,
        api_key_hash: apiKeyHash,
        api_key_prefix: apiKeyPrefix,
        metadata: body.metadata ?? {},
      })
      .select('id, name, description, api_key_prefix, metadata, is_active, created_at, updated_at')
      .single();

    if (error) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to create agent',
      });
    }

    const agentData = agent as AgentRow;

    await auditService.log({
      userId,
      agentId: agentData.id,
      eventType: AUDIT_EVENT_TYPE.AGENT_CREATE,
      details: {
        name: body.name,
        description: body.description,
      },
    });

    // Return with API key (only time it's shown)
    return c.json(
      createApiResponse({
        id: agentData.id,
        name: agentData.name,
        description: agentData.description,
        apiKey, // Only returned on creation
        apiKeyPrefix: agentData.api_key_prefix,
        metadata: agentData.metadata,
        isActive: agentData.is_active,
        createdAt: agentData.created_at,
        updatedAt: agentData.updated_at,
      }),
      HTTP_STATUS.CREATED
    );
  }
);

/**
 * GET /api/v1/agents/:id
 * Get a specific agent by ID.
 */
agents.get('/:id', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);
  const agentId = c.req.param('id');

  const { data: agent, error } = await db
    .from('agents')
    .select('id, name, description, api_key_prefix, metadata, is_active, created_at, updated_at')
    .eq('id', agentId)
    .eq('user_id', userId)
    .single();

  if (error || !agent) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Agent not found',
    });
  }

  const agentData = agent as AgentRow;

  return c.json(
    createApiResponse({
      id: agentData.id,
      name: agentData.name,
      description: agentData.description,
      apiKeyPrefix: agentData.api_key_prefix,
      metadata: agentData.metadata,
      isActive: agentData.is_active,
      createdAt: agentData.created_at,
      updatedAt: agentData.updated_at,
    })
  );
});

/**
 * PATCH /api/v1/agents/:id
 * Update an agent.
 */
agents.patch(
  '/:id',
  zValidator('json', updateAgentSchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const agentId = c.req.param('id');
    const body = c.req.valid('json');
    const auditService = createAuditService(db);

    // Verify agent exists and belongs to user
    const { data: existing } = await db
      .from('agents')
      .select('id')
      .eq('id', agentId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
        message: 'Agent not found',
      });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description ?? null;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data: agent, error } = await db
      .from('agents')
      .update(updateData)
      .eq('id', agentId)
      .select('id, name, description, api_key_prefix, metadata, is_active, created_at, updated_at')
      .single();

    if (error || !agent) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to update agent',
      });
    }

    const agentData = agent as AgentRow;

    await auditService.log({
      userId,
      agentId,
      eventType: AUDIT_EVENT_TYPE.AGENT_UPDATE,
      details: updateData,
    });

    return c.json(
      createApiResponse({
        id: agentData.id,
        name: agentData.name,
        description: agentData.description,
        apiKeyPrefix: agentData.api_key_prefix,
        metadata: agentData.metadata,
        isActive: agentData.is_active,
        createdAt: agentData.created_at,
        updatedAt: agentData.updated_at,
      })
    );
  }
);

/**
 * DELETE /api/v1/agents/:id
 * Delete an agent.
 */
agents.delete('/:id', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);
  const agentId = c.req.param('id');
  const auditService = createAuditService(db);

  // Verify agent exists and belongs to user
  const { data: existing } = await db
    .from('agents')
    .select('id, name')
    .eq('id', agentId)
    .eq('user_id', userId)
    .single();

  if (!existing) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Agent not found',
    });
  }

  const existingData = existing as { id: string; name: string };

  const { error } = await db
    .from('agents')
    .delete()
    .eq('id', agentId);

  if (error) {
    throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      message: 'Failed to delete agent',
    });
  }

  await auditService.log({
    userId,
    agentId,
    eventType: AUDIT_EVENT_TYPE.AGENT_DELETE,
    details: { name: existingData.name },
  });

  return c.json(createApiResponse({ deleted: true }));
});

/**
 * POST /api/v1/agents/:id/rotate-key
 * Rotate an agent's API key.
 */
agents.post('/:id/rotate-key', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);
  const agentId = c.req.param('id');
  const auditService = createAuditService(db);

  // Verify agent exists and belongs to user
  const { data: existing } = await db
    .from('agents')
    .select('id')
    .eq('id', agentId)
    .eq('user_id', userId)
    .single();

  if (!existing) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Agent not found',
    });
  }

  // Generate new API key
  const apiKey = generateApiKey();
  const apiKeyPrefix = getApiKeyPrefix(apiKey);
  const apiKeyHash = await hashApiKey(apiKey);

  const { data: agent, error } = await db
    .from('agents')
    .update({
      api_key_hash: apiKeyHash,
      api_key_prefix: apiKeyPrefix,
    })
    .eq('id', agentId)
    .select('id, name, api_key_prefix, updated_at')
    .single();

  if (error || !agent) {
    throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      message: 'Failed to rotate API key',
    });
  }

  const agentData = agent as { id: string; name: string; api_key_prefix: string; updated_at: string };

  await auditService.log({
    userId,
    agentId,
    eventType: AUDIT_EVENT_TYPE.AGENT_UPDATE,
    details: { action: 'api_key_rotation' },
  });

  // Return with new API key (only time it's shown)
  return c.json(
    createApiResponse({
      id: agentData.id,
      name: agentData.name,
      apiKey, // Only returned on rotation
      apiKeyPrefix: agentData.api_key_prefix,
      updatedAt: agentData.updated_at,
    })
  );
});

export { agents };
