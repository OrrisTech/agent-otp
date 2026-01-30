/**
 * Agent OTP Relay SDK Client.
 *
 * Agent OTP is a secure OTP relay service that helps AI agents
 * receive verification codes (SMS/email) with user approval
 * and end-to-end encryption.
 *
 * @example
 * ```typescript
 * import { AgentOTPClient, generateKeyPair, exportPublicKey } from '@orrisai/agent-otp-sdk';
 *
 * const client = new AgentOTPClient({
 *   apiKey: process.env.AGENT_OTP_API_KEY!,
 * });
 *
 * // Generate encryption keys
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
 * // Consume the OTP
 * if (request.status === 'otp_received') {
 *   const { code } = await client.consumeOTP(request.id, privateKey);
 *   console.log('OTP code:', code);
 * }
 * ```
 */

import type { OTPRequestStatus, OTPMetadata } from '@orrisai/agent-otp-shared';
import type {
  AgentOTPClientConfig,
  RequestOTPOptions,
  OTPRequestResult,
  OTPConsumeResult,
  OTPPendingInfo,
} from './types';
import {
  AgentOTPError,
  AuthenticationError,
  NetworkError,
  TimeoutError,
  OTPNotFoundError,
  OTPExpiredError,
  OTPAlreadyConsumedError,
  OTPApprovalDeniedError,
  OTPCancelledError,
  errorFromStatus,
} from './errors';
import { decryptOTPPayload } from './crypto';

/**
 * Default configuration values.
 */
const DEFAULTS = {
  baseUrl: 'https://api.agentotp.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  pollingInterval: 2000,
  waitTimeout: 120000,
  ttl: 300,
} as const;

/**
 * Agent OTP Relay client for requesting and consuming OTPs.
 */
export class AgentOTPClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly fetchFn: typeof fetch;

  constructor(config: AgentOTPClientConfig) {
    if (!config.apiKey) {
      throw new AuthenticationError('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULTS.baseUrl;
    this.timeout = config.timeout ?? DEFAULTS.timeout;
    this.retryAttempts = config.retryAttempts ?? DEFAULTS.retryAttempts;
    this.retryDelay = config.retryDelay ?? DEFAULTS.retryDelay;
    this.fetchFn = config.fetch ?? fetch;
  }

  /**
   * Request an OTP code from the relay service.
   *
   * The user will be notified and asked to approve sharing the OTP with this agent.
   * Once approved, incoming OTPs matching the filter criteria will be captured
   * and encrypted with the agent's public key.
   *
   * @param options - OTP request options
   * @returns OTP request result
   * @throws {AuthenticationError} If API key is invalid
   * @throws {ValidationError} If request parameters are invalid
   * @throws {OTPApprovalDeniedError} If user denies the request
   * @throws {TimeoutError} If waiting for OTP times out
   */
  async requestOTP(options: RequestOTPOptions): Promise<OTPRequestResult> {
    // Create the OTP request
    const response = await this.request<OTPRequestResult>('POST', '/v1/otp/request', {
      reason: options.reason,
      expected_sender: options.expectedSender,
      filter: options.filter
        ? {
            sources: options.filter.sources,
            sender_pattern: options.filter.senderPattern,
            content_pattern: options.filter.contentPattern,
            received_after: options.filter.receivedAfter?.toISOString(),
          }
        : undefined,
      public_key: options.publicKey,
      ttl: options.ttl ?? DEFAULTS.ttl,
    });

    // If not waiting, return immediately
    if (!options.waitForOTP) {
      return response;
    }

    // Notify callback if pending approval
    if (response.status === 'pending_approval' && options.onPendingApproval) {
      options.onPendingApproval({
        otpRequestId: response.id,
        approvalUrl: response.approvalUrl!,
        webhookUrl: response.webhookUrl!,
        expiresAt: response.expiresAt,
      });
    }

    // Wait for OTP
    return this.waitForOTP(
      response.id,
      options.timeout ?? DEFAULTS.waitTimeout,
      options.pollingInterval ?? DEFAULTS.pollingInterval,
      options.onPendingApproval,
      options.onOTPReceived
    );
  }

  /**
   * Get the current status of an OTP request.
   *
   * @param requestId - The OTP request ID
   * @returns Current OTP request status
   * @throws {OTPNotFoundError} If request ID is not found
   */
  async getOTPStatus(requestId: string): Promise<OTPRequestResult> {
    return this.request<OTPRequestResult>('GET', `/v1/otp/${requestId}`);
  }

  /**
   * Consume the OTP code (one-time read).
   *
   * After calling this, the OTP is deleted from the service.
   * The encrypted payload is decrypted using the agent's private key.
   *
   * @param requestId - The OTP request ID
   * @param privateKey - The agent's private key for decryption
   * @returns Decrypted OTP code and metadata
   * @throws {OTPNotFoundError} If request ID is not found
   * @throws {OTPExpiredError} If OTP request has expired
   * @throws {OTPAlreadyConsumedError} If OTP was already consumed
   * @throws {DecryptionError} If decryption fails
   */
  async consumeOTP(requestId: string, privateKey: CryptoKey): Promise<OTPConsumeResult> {
    // Get the encrypted OTP from the server
    const response = await this.request<{
      encrypted_payload: string;
      encrypted_content?: string;
      metadata: OTPMetadata;
    }>('POST', `/v1/otp/${requestId}/consume`);

    // Decrypt the OTP code
    const code = await decryptOTPPayload(response.encrypted_payload, privateKey);

    // Decrypt full message if present
    let fullMessage: string | undefined;
    if (response.encrypted_content) {
      fullMessage = await decryptOTPPayload(response.encrypted_content, privateKey);
    }

    return {
      code,
      fullMessage,
      metadata: response.metadata,
    };
  }

  /**
   * Cancel a pending OTP request.
   *
   * @param requestId - The OTP request ID
   * @throws {OTPNotFoundError} If request ID is not found
   */
  async cancelOTPRequest(requestId: string): Promise<void> {
    await this.request<void>('DELETE', `/v1/otp/${requestId}`);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Wait for an OTP to be received by polling the status.
   */
  private async waitForOTP(
    requestId: string,
    timeout: number,
    pollingInterval: number,
    onPendingApproval?: (info: OTPPendingInfo) => void,
    onOTPReceived?: (metadata: OTPMetadata) => void
  ): Promise<OTPRequestResult> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getOTPStatus(requestId);

      switch (status.status) {
        case 'otp_received':
          // OTP is ready
          if (onOTPReceived && status.metadata) {
            onOTPReceived(status.metadata);
          }
          return status;

        case 'consumed':
          throw new OTPAlreadyConsumedError();

        case 'denied':
          throw new OTPApprovalDeniedError(
            status.reason ?? 'User denied OTP access',
            status.reason
          );

        case 'expired':
          throw new OTPExpiredError('OTP request expired', status.expiresAt);

        case 'cancelled':
          throw new OTPCancelledError();

        case 'pending_approval':
          // Still waiting for user approval
          if (onPendingApproval && status.approvalUrl) {
            onPendingApproval({
              otpRequestId: status.id,
              approvalUrl: status.approvalUrl,
              webhookUrl: status.webhookUrl!,
              expiresAt: status.expiresAt,
            });
          }
          break;

        case 'approved':
          // Approved but OTP not yet received
          break;
      }

      // Wait before next poll
      await this.sleep(pollingInterval);
    }

    throw new TimeoutError('Timeout waiting for OTP');
  }

  /**
   * Make an HTTP request to the API.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await this.fetchFn(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw this.handleErrorResponse(response.status, errorBody);
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on authentication or validation errors
        if (
          error instanceof AuthenticationError ||
          error instanceof OTPNotFoundError ||
          error instanceof OTPExpiredError ||
          error instanceof OTPAlreadyConsumedError ||
          error instanceof OTPApprovalDeniedError
        ) {
          throw error;
        }

        // Retry on network errors
        if (error instanceof NetworkError && attempt < this.retryAttempts) {
          await this.sleep(this.retryDelay * (attempt + 1));
          continue;
        }

        // Convert abort to timeout
        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError();
        }

        throw error;
      }
    }

    throw lastError ?? new AgentOTPError('Request failed', 'UNKNOWN_ERROR');
  }

  /**
   * Handle error responses from the API.
   */
  private handleErrorResponse(
    status: number,
    body: Record<string, unknown>
  ): AgentOTPError {
    const message = (body.message as string) ?? 'Request failed';
    const code = body.code as string;

    // Handle specific OTP errors
    switch (code) {
      case 'OTP_NOT_FOUND':
        return new OTPNotFoundError(message);
      case 'OTP_EXPIRED':
        return new OTPExpiredError(message, body.expired_at as string);
      case 'OTP_ALREADY_CONSUMED':
        return new OTPAlreadyConsumedError(message, body.consumed_at as string);
      case 'OTP_APPROVAL_DENIED':
        return new OTPApprovalDeniedError(message, body.reason as string);
      case 'OTP_CANCELLED':
        return new OTPCancelledError(message);
    }

    return errorFromStatus(status, message, body);
  }

  /**
   * Sleep for a specified duration.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
