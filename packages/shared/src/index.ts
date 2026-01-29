/**
 * Agent OTP Shared Package
 *
 * Contains shared types, schemas, and constants used across all Agent OTP applications.
 */

// Export constants (values and types)
export * from './constants';

// Export types (interfaces and type aliases)
export * from './types';

// Export schemas and schema-derived types with explicit naming
export {
  // Base schemas
  uuidSchema,
  isoDateStringSchema,
  paginationSchema,
  // User schemas
  createUserSchema,
  updateUserSchema,
  // Agent schemas
  createAgentSchema,
  updateAgentSchema,
  // Policy schemas
  policyConditionSchema,
  policyActionSchema,
  createPolicySchema,
  updatePolicySchema,
  // Permission schemas
  permissionStatusSchema,
  createPermissionRequestSchema,
  // Token schemas
  verifyTokenSchema,
  useTokenSchema,
  // Audit schemas
  auditEventTypeSchema,
  auditLogFilterSchema,
  // Approval schemas
  approvalDecisionSchema,
  // Schema-derived types (with different names than types.ts exports)
  type PaginationInput,
  type VerifyTokenInput,
  type UseTokenInput,
  type ApprovalDecision,
} from './schemas';
