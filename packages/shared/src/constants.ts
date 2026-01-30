/**
 * Application-wide constants for Agent OTP Relay system.
 *
 * Agent OTP is a secure OTP relay service that helps AI agents
 * receive verification codes (SMS/email) with user approval
 * and end-to-end encryption.
 */

// OTP request statuses
export const OTP_REQUEST_STATUS = {
  PENDING_APPROVAL: 'pending_approval', // Waiting for user to approve
  APPROVED: 'approved', // User approved, waiting for OTP to arrive
  OTP_RECEIVED: 'otp_received', // OTP captured and ready to consume
  CONSUMED: 'consumed', // Agent has read the OTP
  DENIED: 'denied', // User denied the request
  EXPIRED: 'expired', // Request expired before OTP arrived
  CANCELLED: 'cancelled', // Agent cancelled the request
} as const;

export type OTPRequestStatus =
  (typeof OTP_REQUEST_STATUS)[keyof typeof OTP_REQUEST_STATUS];

// OTP capture sources
export const OTP_SOURCE = {
  SMS: 'sms', // SMS messages (Android app)
  EMAIL: 'email', // Email messages (Gmail API, IMAP)
  WHATSAPP: 'whatsapp', // WhatsApp messages (future)
} as const;

export type OTPSource = (typeof OTP_SOURCE)[keyof typeof OTP_SOURCE];

// Decision sources
export const DECISION_BY = {
  USER: 'user', // User explicitly approved/denied
  TIMEOUT: 'timeout', // Request timed out
  AUTO: 'auto', // Auto-approved based on rules (future)
} as const;

export type DecisionBy = (typeof DECISION_BY)[keyof typeof DECISION_BY];

// Audit event types for OTP relay
export const AUDIT_EVENT_TYPE = {
  OTP_REQUEST: 'otp_request', // Agent requested an OTP
  OTP_APPROVE: 'otp_approve', // User approved OTP access
  OTP_DENY: 'otp_deny', // User denied OTP access
  OTP_RECEIVE: 'otp_receive', // OTP was captured from source
  OTP_CONSUME: 'otp_consume', // Agent consumed/read the OTP
  OTP_EXPIRE: 'otp_expire', // OTP request expired
  OTP_CANCEL: 'otp_cancel', // Agent cancelled the request
  AGENT_CREATE: 'agent_create',
  AGENT_UPDATE: 'agent_update',
  AGENT_DELETE: 'agent_delete',
  DEVICE_REGISTER: 'device_register', // User registered a device
  DEVICE_REMOVE: 'device_remove', // User removed a device
  EMAIL_CONNECT: 'email_connect', // User connected email
  EMAIL_DISCONNECT: 'email_disconnect', // User disconnected email
} as const;

export type AuditEventType =
  (typeof AUDIT_EVENT_TYPE)[keyof typeof AUDIT_EVENT_TYPE];

// OTP request defaults
export const OTP_DEFAULTS = {
  DEFAULT_TTL_SECONDS: 300, // 5 minutes to wait for OTP
  MAX_TTL_SECONDS: 600, // 10 minutes max
  MIN_TTL_SECONDS: 60, // 1 minute min
  OTP_RETENTION_SECONDS: 60, // Delete OTP 60s after capture if not consumed
  APPROVAL_TIMEOUT_SECONDS: 120, // 2 minutes for user to approve
} as const;

// Rate limiting defaults
export const RATE_LIMIT_DEFAULTS = {
  OTP_REQUESTS_PER_MINUTE: 10, // Max OTP requests per agent per minute
  OTP_APPROVALS_PER_MINUTE: 30, // Max approvals per user per minute
  OTP_CAPTURES_PER_DAY: 100, // Max OTPs captured per user per day
} as const;

// API key prefixes for identification
export const API_KEY_PREFIX = {
  AGENT: 'ak_', // Agent API keys
  USER: 'uk_', // User API keys (for dashboard)
  DEVICE: 'dk_', // Device API keys (for mobile app)
} as const;

// OTP request ID prefix
export const OTP_REQUEST_ID_PREFIX = 'otp_';

// Device types
export const DEVICE_TYPE = {
  ANDROID: 'android',
  IOS: 'ios',
} as const;

export type DeviceType = (typeof DEVICE_TYPE)[keyof typeof DEVICE_TYPE];

// Email integration types
export const EMAIL_INTEGRATION_TYPE = {
  GMAIL_API: 'gmail_api',
  IMAP: 'imap',
  OUTLOOK: 'outlook',
} as const;

export type EmailIntegrationType =
  (typeof EMAIL_INTEGRATION_TYPE)[keyof typeof EMAIL_INTEGRATION_TYPE];

// WebSocket event types
export const WS_EVENT_TYPE = {
  OTP_STATUS_CHANGE: 'otp_status_change',
  OTP_RECEIVED: 'otp_received',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
} as const;

export type WsEventType = (typeof WS_EVENT_TYPE)[keyof typeof WS_EVENT_TYPE];

// HTTP status codes for consistent responses
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Encryption constants
export const ENCRYPTION = {
  ALGORITHM: 'RSA-OAEP',
  HASH: 'SHA-256',
  KEY_SIZE: 2048,
  SYMMETRIC_ALGORITHM: 'AES-GCM',
  SYMMETRIC_KEY_SIZE: 256,
} as const;
