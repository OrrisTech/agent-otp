/**
 * Zod schemas for request/response validation.
 *
 * Agent OTP Relay - Secure OTP relay for AI agents.
 */

import { z } from 'zod';
import {
  OTP_REQUEST_STATUS,
  OTP_SOURCE,
  OTP_DEFAULTS,
  PAGINATION_DEFAULTS,
  AUDIT_EVENT_TYPE,
  DEVICE_TYPE,
  EMAIL_INTEGRATION_TYPE,
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
// OTP Source and Filter Schemas
// ============================================================================

export const otpSourceSchema = z.enum([
  OTP_SOURCE.SMS,
  OTP_SOURCE.EMAIL,
  OTP_SOURCE.WHATSAPP,
]);

export const otpSourceFilterSchema = z.object({
  sources: z.array(otpSourceSchema).optional(),
  senderPattern: z.string().max(255).optional(),
  contentPattern: z.string().max(500).optional(),
  receivedAfter: isoDateStringSchema.optional(),
});

// ============================================================================
// OTP Request Schemas
// ============================================================================

export const otpRequestStatusSchema = z.enum([
  OTP_REQUEST_STATUS.PENDING_APPROVAL,
  OTP_REQUEST_STATUS.APPROVED,
  OTP_REQUEST_STATUS.OTP_RECEIVED,
  OTP_REQUEST_STATUS.CONSUMED,
  OTP_REQUEST_STATUS.DENIED,
  OTP_REQUEST_STATUS.EXPIRED,
  OTP_REQUEST_STATUS.CANCELLED,
]);

export const createOTPRequestSchema = z.object({
  reason: z.string().min(1).max(500),
  expectedSender: z.string().max(255).optional(),
  filter: otpSourceFilterSchema.default({}),
  publicKey: z.string().min(1), // Base64 encoded public key
  ttl: z
    .number()
    .int()
    .min(OTP_DEFAULTS.MIN_TTL_SECONDS)
    .max(OTP_DEFAULTS.MAX_TTL_SECONDS)
    .default(OTP_DEFAULTS.DEFAULT_TTL_SECONDS),
});

// ============================================================================
// Device Schemas
// ============================================================================

export const deviceTypeSchema = z.enum([DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS]);

export const registerDeviceSchema = z.object({
  deviceType: deviceTypeSchema,
  deviceName: z.string().max(255).optional(),
  pushToken: z.string().max(500).optional(),
});

// ============================================================================
// Email Integration Schemas
// ============================================================================

export const emailIntegrationTypeSchema = z.enum([
  EMAIL_INTEGRATION_TYPE.GMAIL_API,
  EMAIL_INTEGRATION_TYPE.IMAP,
  EMAIL_INTEGRATION_TYPE.OUTLOOK,
]);

export const createEmailIntegrationSchema = z.object({
  integrationType: emailIntegrationTypeSchema,
  emailAddress: z.string().email(),
  credentials: z.record(z.string()),
});

// ============================================================================
// OTP Consumption Schemas
// ============================================================================

export const consumeOTPSchema = z.object({
  // Private key is handled client-side for decryption
  // This schema is for the API request
});

// ============================================================================
// Audit Log Schemas
// ============================================================================

export const auditEventTypeSchema = z.enum([
  AUDIT_EVENT_TYPE.OTP_REQUEST,
  AUDIT_EVENT_TYPE.OTP_APPROVE,
  AUDIT_EVENT_TYPE.OTP_DENY,
  AUDIT_EVENT_TYPE.OTP_RECEIVE,
  AUDIT_EVENT_TYPE.OTP_CONSUME,
  AUDIT_EVENT_TYPE.OTP_EXPIRE,
  AUDIT_EVENT_TYPE.OTP_CANCEL,
  AUDIT_EVENT_TYPE.AGENT_CREATE,
  AUDIT_EVENT_TYPE.AGENT_UPDATE,
  AUDIT_EVENT_TYPE.AGENT_DELETE,
  AUDIT_EVENT_TYPE.DEVICE_REGISTER,
  AUDIT_EVENT_TYPE.DEVICE_REMOVE,
  AUDIT_EVENT_TYPE.EMAIL_CONNECT,
  AUDIT_EVENT_TYPE.EMAIL_DISCONNECT,
]);

export const auditLogFilterSchema = z.object({
  userId: uuidSchema.optional(),
  agentId: uuidSchema.optional(),
  otpRequestId: uuidSchema.optional(),
  eventType: auditEventTypeSchema.optional(),
  startDate: isoDateStringSchema.optional(),
  endDate: isoDateStringSchema.optional(),
});

// ============================================================================
// Approval Schemas
// ============================================================================

export const otpApprovalDecisionSchema = z.object({
  approved: z.boolean(),
  reason: z.string().max(500).optional(),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type OTPSource = z.infer<typeof otpSourceSchema>;
export type OTPSourceFilter = z.infer<typeof otpSourceFilterSchema>;
export type OTPRequestStatus = z.infer<typeof otpRequestStatusSchema>;
export type CreateOTPRequestInput = z.infer<typeof createOTPRequestSchema>;
export type DeviceType = z.infer<typeof deviceTypeSchema>;
export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
export type EmailIntegrationType = z.infer<typeof emailIntegrationTypeSchema>;
export type CreateEmailIntegrationInput = z.infer<
  typeof createEmailIntegrationSchema
>;
export type AuditEventType = z.infer<typeof auditEventTypeSchema>;
export type AuditLogFilter = z.infer<typeof auditLogFilterSchema>;
export type OTPApprovalDecision = z.infer<typeof otpApprovalDecisionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
