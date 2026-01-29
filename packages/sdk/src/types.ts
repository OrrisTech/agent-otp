/**
 * Type definitions for the Agent OTP SDK.
 */

import type {
  PermissionStatus,
  TokenVerificationResult,
  TokenUsageResult,
} from '@orrisai/agent-otp-shared';

/**
 * Configuration options for the Agent OTP client.
 */
export interface AgentOTPClientConfig {
  /**
   * API key for authentication.
   * Format: ak_<random_string>
   */
  apiKey: string;

  /**
   * Base URL for the Agent OTP API.
   * @default 'https://api.agentotp.com'
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed requests.
   * @default 3
   */
  retryAttempts?: number;

  /**
   * Delay between retry attempts in milliseconds.
   * @default 1000 (1 second)
   */
  retryDelay?: number;

  /**
   * Custom fetch implementation (useful for testing).
   */
  fetch?: typeof fetch;
}

/**
 * Input for requesting a permission.
 */
export interface RequestPermissionInput {
  /**
   * The action being requested (e.g., 'gmail.send', 'bank.transfer').
   */
  action: string;

  /**
   * The specific resource being accessed (e.g., 'email:user@example.com').
   */
  resource?: string;

  /**
   * Scope restrictions for this permission.
   */
  scope?: Record<string, unknown>;

  /**
   * Additional context about the request.
   */
  context?: Record<string, unknown>;

  /**
   * Time-to-live in seconds for the permission.
   * @default 300 (5 minutes)
   */
  ttl?: number;
}

/**
 * Options for requesting a permission.
 */
export interface RequestPermissionOptions extends RequestPermissionInput {
  /**
   * Whether to wait for human approval if required.
   * If true, the call will block until approved, denied, or timed out.
   * @default false
   */
  waitForApproval?: boolean;

  /**
   * Maximum time to wait for approval in milliseconds.
   * Only used when waitForApproval is true.
   * @default 60000 (60 seconds)
   */
  timeout?: number;

  /**
   * Callback when the request is pending human approval.
   */
  onPendingApproval?: (info: PendingApprovalInfo) => void;

  /**
   * Polling interval in milliseconds when waiting for approval.
   * @default 2000 (2 seconds)
   */
  pollingInterval?: number;
}

/**
 * Information about a pending approval request.
 */
export interface PendingApprovalInfo {
  /**
   * Permission request ID.
   */
  permissionId: string;

  /**
   * URL for the user to approve/deny the request.
   */
  approvalUrl: string;

  /**
   * WebSocket URL for real-time status updates.
   */
  webhookUrl: string;

  /**
   * When the request will expire.
   */
  expiresAt: string;
}

/**
 * Result of a permission request.
 */
export interface PermissionResult {
  /**
   * Permission request ID.
   */
  id: string;

  /**
   * Current status of the permission.
   */
  status: PermissionStatus;

  /**
   * OTP token for the approved permission.
   * Only present when status is 'approved'.
   */
  token?: string;

  /**
   * Granted scope for the permission.
   * May be more restrictive than requested.
   */
  scope?: Record<string, unknown>;

  /**
   * URL for human approval.
   * Only present when status is 'pending'.
   */
  approvalUrl?: string;

  /**
   * WebSocket URL for real-time updates.
   * Only present when status is 'pending'.
   */
  webhookUrl?: string;

  /**
   * When the permission expires.
   */
  expiresAt: string;

  /**
   * Reason for denial or other status.
   */
  reason?: string;
}

/**
 * Input for using a token.
 */
export interface UseTokenInput {
  /**
   * Details about the action being performed.
   */
  actionDetails?: Record<string, unknown>;
}

/**
 * Re-export types from shared package.
 */
export type { PermissionStatus, TokenVerificationResult, TokenUsageResult };
