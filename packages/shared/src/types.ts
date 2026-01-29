/**
 * Core type definitions for Agent OTP system.
 */

import type {
  PermissionStatus,
  PolicyAction,
  DecisionBy,
  AuditEventType,
} from './constants';

// ============================================================================
// Base Types
// ============================================================================

export type UUID = string;
export type ISODateString = string;

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: UUID;
  email: string;
  name: string | null;
  telegramChatId: bigint | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateUserInput {
  email: string;
  name?: string;
  telegramChatId?: bigint;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  telegramChatId?: bigint;
}

// ============================================================================
// Agent Types
// ============================================================================

export interface Agent {
  id: UUID;
  userId: UUID;
  name: string;
  description: string | null;
  apiKeyPrefix: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface AgentWithApiKey extends Agent {
  apiKey: string; // Only returned on creation
}

export interface CreateAgentInput {
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

// ============================================================================
// Policy Types
// ============================================================================

export interface PolicyCondition {
  equals?: string | number | boolean;
  notEquals?: string | number | boolean;
  lessThan?: number;
  greaterThan?: number;
  lessThanOrEqual?: number;
  greaterThanOrEqual?: number;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  matches?: string; // Regex pattern
  in?: (string | number)[];
  notIn?: (string | number)[];
  exists?: boolean;
}

export interface Policy {
  id: UUID;
  userId: UUID;
  agentId: UUID | null;
  name: string;
  description: string | null;
  priority: number;
  conditions: Record<string, PolicyCondition>;
  action: PolicyAction;
  scopeTemplate: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreatePolicyInput {
  agentId?: UUID;
  name: string;
  description?: string;
  priority?: number;
  conditions: Record<string, PolicyCondition>;
  action: PolicyAction;
  scopeTemplate?: Record<string, unknown>;
}

export interface UpdatePolicyInput {
  name?: string;
  description?: string;
  priority?: number;
  conditions?: Record<string, PolicyCondition>;
  action?: PolicyAction;
  scopeTemplate?: Record<string, unknown>;
  isActive?: boolean;
}

export interface PolicyDecision {
  policy?: Policy;
  action: PolicyAction;
  scope?: Record<string, unknown>;
  reason?: string;
}

// ============================================================================
// Permission Request Types
// ============================================================================

export interface PermissionRequest {
  id: UUID;
  agentId: UUID;
  action: string;
  resource: string | null;
  scope: Record<string, unknown>;
  context: Record<string, unknown>;
  status: PermissionStatus;
  policyId: UUID | null;
  decisionReason: string | null;
  decidedBy: DecisionBy | null;
  decidedAt: ISODateString | null;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

export interface CreatePermissionRequestInput {
  action: string;
  resource?: string;
  scope: Record<string, unknown>;
  context?: Record<string, unknown>;
  ttl?: number; // Time-to-live in seconds
}

export interface PermissionRequestResult {
  id: UUID;
  status: PermissionStatus;
  token?: string; // Only returned on approval
  scope?: Record<string, unknown>;
  approvalUrl?: string; // For pending requests requiring human approval
  webhookUrl?: string; // WebSocket URL for real-time status updates
  expiresAt: ISODateString;
  reason?: string;
}

// ============================================================================
// Token Types
// ============================================================================

export interface Token {
  id: UUID;
  permissionRequestId: UUID;
  scope: Record<string, unknown>;
  usesRemaining: number;
  expiresAt: ISODateString;
  usedAt: ISODateString | null;
  revokedAt: ISODateString | null;
  createdAt: ISODateString;
}

export interface TokenVerificationResult {
  valid: boolean;
  scope?: Record<string, unknown>;
  usesRemaining?: number;
  expiresAt?: ISODateString;
  reason?: string;
}

export interface TokenUsageInput {
  token: string;
  actionDetails?: Record<string, unknown>;
}

export interface TokenUsageResult {
  success: boolean;
  usesRemaining: number;
  reason?: string;
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLog {
  id: UUID;
  userId: UUID | null;
  agentId: UUID | null;
  permissionRequestId: UUID | null;
  eventType: AuditEventType;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: ISODateString;
}

export interface AuditLogFilter {
  userId?: UUID;
  agentId?: UUID;
  permissionRequestId?: UUID;
  eventType?: AuditEventType;
  startDate?: ISODateString;
  endDate?: ISODateString;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WsMessage {
  type: string;
  payload?: unknown;
}

export interface WsStatusChangeMessage extends WsMessage {
  type: 'status_change';
  payload: {
    permissionId: UUID;
    status: PermissionStatus;
    token?: string;
    reason?: string;
  };
}

export interface WsErrorMessage extends WsMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Telegram Types
// ============================================================================

export interface TelegramApprovalRequest {
  permissionRequestId: UUID;
  agentName: string;
  action: string;
  resource?: string;
  scope: Record<string, unknown>;
  context: Record<string, unknown>;
  expiresAt: ISODateString;
}

// ============================================================================
// SDK Types
// ============================================================================

export interface AgentOTPClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RequestPermissionOptions extends CreatePermissionRequestInput {
  waitForApproval?: boolean;
  timeout?: number;
  onPendingApproval?: (info: PendingApprovalInfo) => void;
}

export interface PendingApprovalInfo {
  permissionId: UUID;
  approvalUrl: string;
  webhookUrl: string;
  expiresAt: ISODateString;
}
