/**
 * Application-wide constants for Agent OTP system.
 */

// Permission request statuses
export const PERMISSION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  EXPIRED: 'expired',
  USED: 'used',
} as const;

export type PermissionStatus =
  (typeof PERMISSION_STATUS)[keyof typeof PERMISSION_STATUS];

// Policy actions
export const POLICY_ACTION = {
  AUTO_APPROVE: 'auto_approve',
  REQUIRE_APPROVAL: 'require_approval',
  DENY: 'deny',
} as const;

export type PolicyAction = (typeof POLICY_ACTION)[keyof typeof POLICY_ACTION];

// Decision sources
export const DECISION_BY = {
  AUTO: 'auto',
  USER: 'user',
  TIMEOUT: 'timeout',
} as const;

export type DecisionBy = (typeof DECISION_BY)[keyof typeof DECISION_BY];

// Audit event types
export const AUDIT_EVENT_TYPE = {
  REQUEST: 'request',
  APPROVE: 'approve',
  DENY: 'deny',
  USE: 'use',
  REVOKE: 'revoke',
  EXPIRE: 'expire',
  AGENT_CREATE: 'agent_create',
  AGENT_UPDATE: 'agent_update',
  AGENT_DELETE: 'agent_delete',
  POLICY_CREATE: 'policy_create',
  POLICY_UPDATE: 'policy_update',
  POLICY_DELETE: 'policy_delete',
} as const;

export type AuditEventType =
  (typeof AUDIT_EVENT_TYPE)[keyof typeof AUDIT_EVENT_TYPE];

// Token defaults
export const TOKEN_DEFAULTS = {
  DEFAULT_TTL_SECONDS: 300, // 5 minutes
  MAX_TTL_SECONDS: 3600, // 1 hour
  MIN_TTL_SECONDS: 30, // 30 seconds
  DEFAULT_USES: 1, // Single use by default
  UNLIMITED_USES: -1, // -1 means unlimited within TTL
} as const;

// Rate limiting defaults
export const RATE_LIMIT_DEFAULTS = {
  REQUESTS_PER_WINDOW: 100,
  WINDOW_MS: 60000, // 1 minute
} as const;

// API key prefixes for identification
export const API_KEY_PREFIX = {
  AGENT: 'ak_', // Agent API keys
  USER: 'uk_', // User API keys (for dashboard)
} as const;

// Token prefix
export const TOKEN_PREFIX = 'otp_';

// Permission request ID prefix
export const PERMISSION_ID_PREFIX = 'perm_';

// WebSocket event types
export const WS_EVENT_TYPE = {
  STATUS_CHANGE: 'status_change',
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
  SERVICE_UNAVAILABLE: 503,
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
