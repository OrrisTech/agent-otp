/**
 * Policy management routes (for dashboard users).
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import type { Env } from '../lib/env';
import { createDbClient, type PolicyRow } from '../lib/db';
import { createApiResponse } from '../lib/utils';
import { createAuditService } from '../services/audit-service';
import {
  createPolicySchema,
  updatePolicySchema,
  paginationSchema,
} from '@orrisai/agent-otp-shared';
import { AUDIT_EVENT_TYPE, HTTP_STATUS } from '@orrisai/agent-otp-shared';

const policies = new Hono<{ Bindings: Env }>();

/**
 * Helper to get user ID from request.
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
 * GET /api/v1/policies
 * List all policies for the authenticated user.
 */
policies.get(
  '/',
  zValidator('query', paginationSchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const { page, limit } = c.req.valid('query');
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await db
      .from('policies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get policies
    const { data, error } = await db
      .from('policies')
      .select(`
        id, agent_id, name, description, priority,
        conditions, action, scope_template, is_active,
        created_at, updated_at,
        agents!left(name)
      `)
      .eq('user_id', userId)
      .order('priority', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to fetch policies',
      });
    }

    // Handle Supabase response which may return agents as array
    const policyList = (data ?? []) as Array<{
      id: string;
      agent_id: string | null;
      name: string;
      description: string | null;
      priority: number;
      conditions: Record<string, unknown>;
      action: string;
      scope_template: Record<string, unknown> | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      agents: { name: string }[] | { name: string } | null;
    }>;

    return c.json(
      createApiResponse(
        policyList.map((policy) => {
          const agentName = policy.agents
            ? (Array.isArray(policy.agents) ? policy.agents[0]?.name : policy.agents.name)
            : null;
          return {
            id: policy.id,
            agentId: policy.agent_id,
            agentName,
            name: policy.name,
            description: policy.description,
            priority: policy.priority,
            conditions: policy.conditions,
            action: policy.action,
            scopeTemplate: policy.scope_template,
            isActive: policy.is_active,
            createdAt: policy.created_at,
            updatedAt: policy.updated_at,
          };
        }),
        { page, limit, total: count ?? 0 }
      )
    );
  }
);

/**
 * POST /api/v1/policies
 * Create a new policy.
 */
policies.post(
  '/',
  zValidator('json', createPolicySchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const body = c.req.valid('json');
    const auditService = createAuditService(db);

    // If agentId is specified, verify it belongs to the user
    if (body.agentId) {
      const { data: agent } = await db
        .from('agents')
        .select('id')
        .eq('id', body.agentId)
        .eq('user_id', userId)
        .single();

      if (!agent) {
        throw new HTTPException(HTTP_STATUS.BAD_REQUEST, {
          message: 'Agent not found or does not belong to user',
        });
      }
    }

    // Create policy
    const { data: policy, error } = await db
      .from('policies')
      .insert({
        user_id: userId,
        agent_id: body.agentId ?? null,
        name: body.name,
        description: body.description ?? null,
        priority: body.priority ?? 0,
        conditions: body.conditions,
        action: body.action,
        scope_template: body.scopeTemplate ?? null,
      })
      .select('*')
      .single();

    if (error) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to create policy',
      });
    }

    const policyData = policy as PolicyRow;

    await auditService.log({
      userId,
      eventType: AUDIT_EVENT_TYPE.POLICY_CREATE,
      details: {
        policyId: policyData.id,
        name: body.name,
        action: body.action,
      },
    });

    return c.json(
      createApiResponse({
        id: policyData.id,
        agentId: policyData.agent_id,
        name: policyData.name,
        description: policyData.description,
        priority: policyData.priority,
        conditions: policyData.conditions,
        action: policyData.action,
        scopeTemplate: policyData.scope_template,
        isActive: policyData.is_active,
        createdAt: policyData.created_at,
        updatedAt: policyData.updated_at,
      }),
      HTTP_STATUS.CREATED
    );
  }
);

/**
 * GET /api/v1/policies/:id
 * Get a specific policy by ID.
 */
policies.get('/:id', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);
  const policyId = c.req.param('id');

  const { data: policy, error } = await db
    .from('policies')
    .select(`
      id, agent_id, name, description, priority,
      conditions, action, scope_template, is_active,
      created_at, updated_at,
      agents!left(name)
    `)
    .eq('id', policyId)
    .eq('user_id', userId)
    .single();

  if (error || !policy) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Policy not found',
    });
  }

  const policyData = policy as {
    id: string;
    agent_id: string | null;
    name: string;
    description: string | null;
    priority: number;
    conditions: Record<string, unknown>;
    action: string;
    scope_template: Record<string, unknown> | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    agents: { name: string }[] | { name: string } | null;
  };
  const agentName = policyData.agents
    ? (Array.isArray(policyData.agents) ? policyData.agents[0]?.name : policyData.agents.name)
    : null;

  return c.json(
    createApiResponse({
      id: policyData.id,
      agentId: policyData.agent_id,
      agentName,
      name: policyData.name,
      description: policyData.description,
      priority: policyData.priority,
      conditions: policyData.conditions,
      action: policyData.action,
      scopeTemplate: policyData.scope_template,
      isActive: policyData.is_active,
      createdAt: policyData.created_at,
      updatedAt: policyData.updated_at,
    })
  );
});

/**
 * PATCH /api/v1/policies/:id
 * Update a policy.
 */
policies.patch(
  '/:id',
  zValidator('json', updatePolicySchema),
  async (c) => {
    const userId = getUserId(c);
    const db = createDbClient(c.env);
    const policyId = c.req.param('id');
    const body = c.req.valid('json');
    const auditService = createAuditService(db);

    // Verify policy exists and belongs to user
    const { data: existing } = await db
      .from('policies')
      .select('id')
      .eq('id', policyId)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
        message: 'Policy not found',
      });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description ?? null;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.conditions !== undefined) updateData.conditions = body.conditions;
    if (body.action !== undefined) updateData.action = body.action;
    if (body.scopeTemplate !== undefined) {
      updateData.scope_template = body.scopeTemplate ?? null;
    }
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data: policy, error } = await db
      .from('policies')
      .update(updateData)
      .eq('id', policyId)
      .select('*')
      .single();

    if (error || !policy) {
      throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        message: 'Failed to update policy',
      });
    }

    const policyData = policy as PolicyRow;

    await auditService.log({
      userId,
      eventType: AUDIT_EVENT_TYPE.POLICY_UPDATE,
      details: {
        policyId,
        changes: updateData,
      },
    });

    return c.json(
      createApiResponse({
        id: policyData.id,
        agentId: policyData.agent_id,
        name: policyData.name,
        description: policyData.description,
        priority: policyData.priority,
        conditions: policyData.conditions,
        action: policyData.action,
        scopeTemplate: policyData.scope_template,
        isActive: policyData.is_active,
        createdAt: policyData.created_at,
        updatedAt: policyData.updated_at,
      })
    );
  }
);

/**
 * DELETE /api/v1/policies/:id
 * Delete a policy.
 */
policies.delete('/:id', async (c) => {
  const userId = getUserId(c);
  const db = createDbClient(c.env);
  const policyId = c.req.param('id');
  const auditService = createAuditService(db);

  // Verify policy exists and belongs to user
  const { data: existing } = await db
    .from('policies')
    .select('id, name')
    .eq('id', policyId)
    .eq('user_id', userId)
    .single();

  if (!existing) {
    throw new HTTPException(HTTP_STATUS.NOT_FOUND, {
      message: 'Policy not found',
    });
  }

  const existingData = existing as { id: string; name: string };

  const { error } = await db
    .from('policies')
    .delete()
    .eq('id', policyId);

  if (error) {
    throw new HTTPException(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      message: 'Failed to delete policy',
    });
  }

  await auditService.log({
    userId,
    eventType: AUDIT_EVENT_TYPE.POLICY_DELETE,
    details: { policyId, name: existingData.name },
  });

  return c.json(createApiResponse({ deleted: true }));
});

export { policies };
