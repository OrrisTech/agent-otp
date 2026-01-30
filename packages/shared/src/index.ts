/**
 * Agent OTP Shared Package
 *
 * Contains shared types, schemas, and constants for the Agent OTP Relay system.
 * Agent OTP is a secure OTP relay service that helps AI agents receive
 * verification codes (SMS/email) with user approval and E2E encryption.
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
  // OTP schemas
  otpSourceSchema,
  otpSourceFilterSchema,
  otpRequestStatusSchema,
  createOTPRequestSchema,
  // Device schemas
  deviceTypeSchema,
  registerDeviceSchema,
  // Email integration schemas
  emailIntegrationTypeSchema,
  createEmailIntegrationSchema,
  // Audit schemas
  auditEventTypeSchema,
  auditLogFilterSchema,
  // Approval schemas
  otpApprovalDecisionSchema,
  // Schema-derived types
  type PaginationInput,
  type CreateOTPRequestInput,
  type OTPApprovalDecision,
  type RegisterDeviceInput,
  type CreateEmailIntegrationInput,
} from './schemas';
