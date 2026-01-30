/**
 * Type definitions for the Agent OTP Relay SDK.
 *
 * Agent OTP is a secure OTP relay service that helps AI agents
 * receive verification codes (SMS/email) with user approval
 * and end-to-end encryption.
 */

import type {
  OTPRequestStatus,
  OTPSource,
  OTPMetadata,
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
 * Filter criteria for matching incoming OTPs.
 */
export interface OTPSourceFilter {
  /**
   * Only accept OTPs from these sources.
   */
  sources?: OTPSource[];

  /**
   * Sender pattern matching (e.g., "Google", "+1555*", "*@acme.com").
   * Supports wildcards (*).
   */
  senderPattern?: string;

  /**
   * Content/subject pattern matching (regex).
   */
  contentPattern?: string;

  /**
   * Only accept OTPs received after this timestamp.
   */
  receivedAfter?: Date;
}

/**
 * Options for requesting an OTP.
 */
export interface RequestOTPOptions {
  /**
   * Human-readable reason why the agent needs the OTP.
   * This is shown to the user when they approve the request.
   */
  reason: string;

  /**
   * Expected sender/service (e.g., "Google", "GitHub").
   * Helps the user identify the relevant OTP.
   */
  expectedSender?: string;

  /**
   * Filter criteria for OTP matching.
   */
  filter?: OTPSourceFilter;

  /**
   * Agent's public key for E2E encryption (base64 encoded).
   * The OTP will be encrypted with this key and only the agent
   * with the corresponding private key can decrypt it.
   */
  publicKey: string;

  /**
   * Time-to-live for the request in seconds.
   * @default 300 (5 minutes)
   */
  ttl?: number;

  /**
   * Whether to wait for OTP to arrive before returning.
   * If true, the call will block until OTP is received or timeout.
   * @default false
   */
  waitForOTP?: boolean;

  /**
   * Maximum time to wait for OTP in milliseconds.
   * Only used when waitForOTP is true.
   * @default 120000 (2 minutes)
   */
  timeout?: number;

  /**
   * Callback when the request is pending user approval.
   */
  onPendingApproval?: (info: OTPPendingInfo) => void;

  /**
   * Callback when OTP is received (before consumption).
   */
  onOTPReceived?: (metadata: OTPMetadata) => void;

  /**
   * Polling interval in milliseconds when waiting for OTP.
   * @default 2000 (2 seconds)
   */
  pollingInterval?: number;
}

/**
 * Information about a pending OTP approval request.
 */
export interface OTPPendingInfo {
  /**
   * OTP request ID.
   */
  otpRequestId: string;

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
 * Result of an OTP request.
 */
export interface OTPRequestResult {
  /**
   * OTP request ID.
   */
  id: string;

  /**
   * Current status of the OTP request.
   */
  status: OTPRequestStatus;

  /**
   * Encrypted OTP payload (only when status is 'otp_received').
   * Decrypt using the agent's private key.
   */
  encryptedPayload?: string;

  /**
   * URL for user approval.
   * Only present when status is 'pending_approval'.
   */
  approvalUrl?: string;

  /**
   * WebSocket URL for real-time updates.
   * Only present when status is 'pending_approval' or 'approved'.
   */
  webhookUrl?: string;

  /**
   * OTP metadata (sender, source, etc.).
   * Only present when status is 'otp_received'.
   */
  metadata?: OTPMetadata;

  /**
   * When the request expires.
   */
  expiresAt: string;

  /**
   * Reason for denial or other status.
   */
  reason?: string;
}

/**
 * Result of consuming an OTP.
 */
export interface OTPConsumeResult {
  /**
   * The actual OTP code.
   */
  code: string;

  /**
   * Full message content (if user allowed).
   */
  fullMessage?: string;

  /**
   * Metadata about the OTP.
   */
  metadata: OTPMetadata;
}

/**
 * Re-export types from shared package.
 */
export type { OTPRequestStatus, OTPSource, OTPMetadata };
