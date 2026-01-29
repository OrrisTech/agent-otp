/**
 * Zod schemas for request/response validation.
 */

import { z } from 'zod';
import {
  PERMISSION_STATUS,
  POLICY_ACTION,
  TOKEN_DEFAULTS,
  PAGINATION_DEFAULTS,
  AUDIT_EVENT_TYPE,
} from './constants';

// ============================================================================
// Base Schemas
// ============================================================================

export const uuidSchema = z.string().uuid();

export const isoDateStringSchema = z.string().datetime();

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(PAGINATION_DEFAULTS.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_DEFAULTS.MAX_LIMIT)
    .default(PAGINATION_DEFAULTS.DEFAULT_LIMIT),
});

// ============================================================================
// User Schemas
// ============================================================================

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255).optional(),
  telegramChatId: z.coerce.bigint().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(255).optional(),
  telegramChatId: z.coerce.bigint().nullable().optional(),
});

// ============================================================================
// Agent Schemas
// ============================================================================

export const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  metadata: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Policy Schemas
// ============================================================================

export const policyConditionSchema = z.object({
  equals: z.union([z.string(), z.number(), z.boolean()]).optional(),
  notEquals: z.union([z.string(), z.number(), z.boolean()]).optional(),
  lessThan: z.number().optional(),
  greaterThan: z.number().optional(),
  lessThanOrEqual: z.number().optional(),
  greaterThanOrEqual: z.number().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  contains: z.string().optional(),
  matches: z.string().optional(), // Regex pattern
  in: z.array(z.union([z.string(), z.number()])).optional(),
  notIn: z.array(z.union([z.string(), z.number()])).optional(),
  exists: z.boolean().optional(),
});

export const policyActionSchema = z.enum([
  POLICY_ACTION.AUTO_APPROVE,
  POLICY_ACTION.REQUIRE_APPROVAL,
  POLICY_ACTION.DENY,
]);

export const createPolicySchema = z.object({
  agentId: uuidSchema.optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  priority: z.number().int().default(0),
  conditions: z.record(policyConditionSchema),
  action: policyActionSchema,
  scopeTemplate: z.record(z.unknown()).optional(),
});

export const updatePolicySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  priority: z.number().int().optional(),
  conditions: z.record(policyConditionSchema).optional(),
  action: policyActionSchema.optional(),
  scopeTemplate: z.record(z.unknown()).nullable().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Permission Request Schemas
// ============================================================================

export const permissionStatusSchema = z.enum([
  PERMISSION_STATUS.PENDING,
  PERMISSION_STATUS.APPROVED,
  PERMISSION_STATUS.DENIED,
  PERMISSION_STATUS.EXPIRED,
  PERMISSION_STATUS.USED,
]);

export const createPermissionRequestSchema = z.object({
  action: z.string().min(1).max(255),
  resource: z.string().max(255).optional(),
  scope: z.record(z.unknown()).default({}),
  context: z.record(z.unknown()).default({}),
  ttl: z
    .number()
    .int()
    .min(TOKEN_DEFAULTS.MIN_TTL_SECONDS)
    .max(TOKEN_DEFAULTS.MAX_TTL_SECONDS)
    .default(TOKEN_DEFAULTS.DEFAULT_TTL_SECONDS),
});

// ============================================================================
// Token Schemas
// ============================================================================

export const verifyTokenSchema = z.object({
  token: z.string().min(1),
});

export const useTokenSchema = z.object({
  token: z.string().min(1),
  actionDetails: z.record(z.unknown()).optional(),
});

// ============================================================================
// Audit Log Schemas
// ============================================================================

export const auditEventTypeSchema = z.enum([
  AUDIT_EVENT_TYPE.REQUEST,
  AUDIT_EVENT_TYPE.APPROVE,
  AUDIT_EVENT_TYPE.DENY,
  AUDIT_EVENT_TYPE.USE,
  AUDIT_EVENT_TYPE.REVOKE,
  AUDIT_EVENT_TYPE.EXPIRE,
  AUDIT_EVENT_TYPE.AGENT_CREATE,
  AUDIT_EVENT_TYPE.AGENT_UPDATE,
  AUDIT_EVENT_TYPE.AGENT_DELETE,
  AUDIT_EVENT_TYPE.POLICY_CREATE,
  AUDIT_EVENT_TYPE.POLICY_UPDATE,
  AUDIT_EVENT_TYPE.POLICY_DELETE,
]);

export const auditLogFilterSchema = z.object({
  userId: uuidSchema.optional(),
  agentId: uuidSchema.optional(),
  permissionRequestId: uuidSchema.optional(),
  eventType: auditEventTypeSchema.optional(),
  startDate: isoDateStringSchema.optional(),
  endDate: isoDateStringSchema.optional(),
});

// ============================================================================
// Approval Schemas
// ============================================================================

export const approvalDecisionSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
  scopeModifications: z.record(z.unknown()).optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type PolicyCondition = z.infer<typeof policyConditionSchema>;
export type PolicyAction = z.infer<typeof policyActionSchema>;
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
export type PermissionStatus = z.infer<typeof permissionStatusSchema>;
export type CreatePermissionRequestInput = z.infer<
  typeof createPermissionRequestSchema
>;
export type VerifyTokenInput = z.infer<typeof verifyTokenSchema>;
export type UseTokenInput = z.infer<typeof useTokenSchema>;
export type AuditEventType = z.infer<typeof auditEventTypeSchema>;
export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;
export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
