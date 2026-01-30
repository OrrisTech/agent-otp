/**
 * Agent OTP Relay SDK
 *
 * A secure OTP relay service that helps AI agents receive verification codes
 * (SMS/email) with user approval and end-to-end encryption.
 *
 * @example
 * ```typescript
 * import {
 *   AgentOTPClient,
 *   generateKeyPair,
 *   exportPublicKey
 * } from '@orrisai/agent-otp-sdk';
 *
 * const client = new AgentOTPClient({
 *   apiKey: process.env.AGENT_OTP_API_KEY!,
 * });
 *
 * // Generate encryption keys (do this once, store private key securely)
 * const { publicKey, privateKey } = await generateKeyPair();
 *
 * // Request an OTP
 * const request = await client.requestOTP({
 *   reason: 'Sign up for Acme service',
 *   expectedSender: 'Acme',
 *   publicKey: await exportPublicKey(publicKey),
 *   waitForOTP: true,
 * });
 *
 * // Consume the OTP (decrypts and deletes from server)
 * if (request.status === 'otp_received') {
 *   const { code } = await client.consumeOTP(request.id, privateKey);
 *   console.log('OTP code:', code);
 * }
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { AgentOTPClient } from './client';

// Types
export type {
  AgentOTPClientConfig,
  RequestOTPOptions,
  OTPRequestResult,
  OTPConsumeResult,
  OTPPendingInfo,
  OTPSourceFilter,
  OTPRequestStatus,
  OTPSource,
  OTPMetadata,
} from './types';

// Error classes
export {
  AgentOTPError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  TimeoutError,
  NetworkError,
  ServerError,
  OTPNotFoundError,
  OTPExpiredError,
  OTPAlreadyConsumedError,
  OTPApprovalDeniedError,
  OTPCancelledError,
  DecryptionError,
} from './errors';

// Crypto utilities for E2E encryption
export {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  exportPrivateKey,
  importPrivateKey,
  decryptOTPPayload,
  encryptWithPublicKey,
} from './crypto';
