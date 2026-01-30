/**
 * Core type definitions for Agent OTP Relay system.
 *
 * Agent OTP is a secure OTP relay service that helps AI agents
 * receive verification codes (SMS/email) with user approval
 * and end-to-end encryption.
 */

import type {
  OTPRequestStatus,
  OTPSource,
  DecisionBy,
  AuditEventType,
  DeviceType,
  EmailIntegrationType,
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
// OTP Source Filter Types
// ============================================================================

/**
 * Filter criteria for matching incoming OTPs.
 */
export interface OTPSourceFilter {
  /** Only accept OTPs from these sources */
  sources?: OTPSource[];

  /** Sender pattern matching (e.g., "Google", "+1555*", "*@acme.com") */
  senderPattern?: string;

  /** Content/subject pattern matching (regex) */
  contentPattern?: string;

  /** Only accept OTPs received after this timestamp */
  receivedAfter?: ISODateString;
}

// ============================================================================
// OTP Request Types
// ============================================================================

/**
 * An OTP request from an agent.
 */
export interface OTPRequest {
  id: UUID;
  agentId: UUID;
  reason: string;
  expectedSender: string | null;
  filter: OTPSourceFilter;
  publicKey: string; // Agent's public key for E2E encryption
  status: OTPRequestStatus;
  decisionReason: string | null;
  decidedBy: DecisionBy | null;
  decidedAt: ISODateString | null;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

/**
 * Input for creating an OTP request.
 */
export interface CreateOTPRequestInput {
  /** Human-readable reason why the agent needs the OTP */
  reason: string;

  /** Expected sender/service (e.g., "Google", "GitHub") */
  expectedSender?: string;

  /** Filter criteria for OTP matching */
  filter?: OTPSourceFilter;

  /** Agent's public key for E2E encryption (base64) */
  publicKey: string;

  /** Time-to-live in seconds (default: 300) */
  ttl?: number;
}

/**
 * Result of an OTP request operation.
 */
export interface OTPRequestResult {
  id: UUID;
  status: OTPRequestStatus;
  approvalUrl?: string; // URL for user to approve
  webhookUrl?: string; // WebSocket URL for real-time updates
  expiresAt: ISODateString;
  reason?: string; // Reason if denied
}

// ============================================================================
// Captured OTP Types
// ============================================================================

/**
 * A captured OTP message.
 */
export interface CapturedOTP {
  id: UUID;
  userId: UUID;
  otpRequestId: UUID | null;
  source: OTPSource;
  sender: string;
  encryptedCode: string; // Encrypted with agent's public key
  encryptedContent: string | null; // Full message content (optional)
  contentPreview: string | null; // First N chars for user verification
  metadata: OTPMetadata;
  receivedAt: ISODateString;
  consumedAt: ISODateString | null;
  expiresAt: ISODateString;
  createdAt: ISODateString;
}

/**
 * Metadata about a captured OTP.
 */
export interface OTPMetadata {
  /** Original sender identifier */
  sender: string;

  /** Source channel (sms, email, whatsapp) */
  source: OTPSource;

  /** When the OTP was received */
  receivedAt: ISODateString;

  /** Partial preview of the message (for user verification) */
  preview?: string;

  /** Additional source-specific metadata */
  extra?: Record<string, unknown>;
}

/**
 * Result of consuming an OTP.
 */
export interface OTPConsumeResult {
  /** The actual OTP code */
  code: string;

  /** Full message content (if user allowed) */
  fullMessage?: string;

  /** Metadata about the OTP */
  metadata: OTPMetadata;
}

/**
 * Full OTP status response.
 */
export interface OTPStatus {
  id: UUID;
  status: OTPRequestStatus;
  /** Encrypted OTP payload (only when status is 'otp_received') */
  encryptedPayload?: string;
  /** OTP metadata */
  metadata?: OTPMetadata;
  expiresAt: ISODateString;
}

// ============================================================================
// Device Types
// ============================================================================

/**
 * A registered user device for OTP capture.
 */
export interface UserDevice {
  id: UUID;
  userId: UUID;
  deviceType: DeviceType;
  deviceName: string | null;
  pushToken: string | null;
  isActive: boolean;
  lastSeenAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface RegisterDeviceInput {
  deviceType: DeviceType;
  deviceName?: string;
  pushToken?: string;
}

// ============================================================================
// Email Integration Types
// ============================================================================

/**
 * An email integration for OTP capture.
 */
export interface EmailIntegration {
  id: UUID;
  userId: UUID;
  integrationType: EmailIntegrationType;
  emailAddress: string;
  isActive: boolean;
  lastSyncAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateEmailIntegrationInput {
  integrationType: EmailIntegrationType;
  emailAddress: string;
  credentials: Record<string, string>; // OAuth tokens or IMAP creds
}

// ============================================================================
// Audit Log Types
// ============================================================================

export interface AuditLog {
  id: UUID;
  userId: UUID | null;
  agentId: UUID | null;
  otpRequestId: UUID | null;
  eventType: AuditEventType;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: ISODateString;
}

export interface AuditLogFilter {
  userId?: UUID;
  agentId?: UUID;
  otpRequestId?: UUID;
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

export interface WsOTPStatusChangeMessage extends WsMessage {
  type: 'otp_status_change';
  payload: {
    otpRequestId: UUID;
    status: OTPRequestStatus;
    reason?: string;
  };
}

export interface WsOTPReceivedMessage extends WsMessage {
  type: 'otp_received';
  payload: {
    otpRequestId: UUID;
    metadata: OTPMetadata;
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

export interface TelegramOTPApprovalRequest {
  otpRequestId: UUID;
  agentName: string;
  reason: string;
  expectedSender?: string;
  expiresAt: ISODateString;
}

// ============================================================================
// SDK Types
// ============================================================================

/**
 * Configuration for the Agent OTP SDK client.
 */
export interface AgentOTPClientConfig {
  /** API key for authentication (format: ak_xxx) */
  apiKey: string;

  /** Base URL for the API (default: https://api.agentotp.com) */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of retry attempts for network errors (default: 3) */
  retryAttempts?: number;

  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Options for requesting an OTP.
 */
export interface RequestOTPOptions extends CreateOTPRequestInput {
  /** Wait for OTP to arrive before returning (default: false) */
  waitForOTP?: boolean;

  /** Timeout when waiting for OTP in ms (default: 120000) */
  timeout?: number;

  /** Callback when request is pending user approval */
  onPendingApproval?: (info: OTPPendingInfo) => void;

  /** Callback when OTP is received (before consumption) */
  onOTPReceived?: (metadata: OTPMetadata) => void;

  /** Polling interval in ms when waiting (default: 2000) */
  pollingInterval?: number;
}

/**
 * Info provided when OTP request is pending approval.
 */
export interface OTPPendingInfo {
  otpRequestId: UUID;
  approvalUrl: string;
  webhookUrl: string;
  expiresAt: ISODateString;
}
