/**
 * Agent OTP SDK
 *
 * TypeScript SDK for AI agents to request and manage one-time permissions
 * for sensitive operations.
 *
 * @example
 * ```typescript
 * import { AgentOTPClient } from '@orrisai/agent-otp-sdk';
 *
 * const client = new AgentOTPClient({
 *   apiKey: 'ak_your_api_key_here',
 * });
 *
 * // Request permission for an action
 * const permission = await client.requestPermission({
 *   action: 'gmail.send',
 *   resource: 'email:recipient@example.com',
 *   scope: { max_emails: 1 },
 *   context: { reason: 'Sending invoice' },
 *   waitForApproval: true,
 * });
 *
 * if (permission.status === 'approved') {
 *   // Use the token for your operation
 *   const result = await sendEmail({
 *     to: 'recipient@example.com',
 *     otpToken: permission.token,
 *   });
 *
 *   // Mark token as used
 *   await client.useToken(permission.id, permission.token);
 * }
 * ```
 *
 * @packageDocumentation
 */

export { AgentOTPClient } from './client';

export type {
  AgentOTPClientConfig,
  RequestPermissionOptions,
  PermissionResult,
  PendingApprovalInfo,
  UseTokenInput,
  PermissionStatus,
  TokenVerificationResult,
  TokenUsageResult,
} from './types';

export {
  AgentOTPError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  TimeoutError,
  PermissionDeniedError,
  PermissionExpiredError,
  InvalidTokenError,
  NetworkError,
  ServerError,
  TokenUsedError,
  TokenRevokedError,
} from './errors';

// Re-export useful constants
export {
  PERMISSION_STATUS,
  POLICY_ACTION,
  TOKEN_DEFAULTS,
} from '@orrisai/agent-otp-shared';
