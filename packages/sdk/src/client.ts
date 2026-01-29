/**
 * Agent OTP Client - Main SDK class for interacting with the Agent OTP API.
 */

import { PERMISSION_STATUS, TOKEN_DEFAULTS } from '@orrisai/agent-otp-shared';
import type { TokenVerificationResult, TokenUsageResult } from '@orrisai/agent-otp-shared';
import type {
  AgentOTPClientConfig,
  RequestPermissionOptions,
  PermissionResult,
  UseTokenInput,
} from './types';
import {
  AgentOTPError,
  AuthenticationError,
  TimeoutError,
  PermissionDeniedError,
  PermissionExpiredError,
  NetworkError,
  errorFromStatus,
} from './errors';

const DEFAULT_BASE_URL = 'https://api.agentotp.com';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000;
const DEFAULT_POLLING_INTERVAL = 2000;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Agent OTP Client for AI agents to request and manage permissions.
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
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retryAttempts = config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;
    this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
    this.fetchFn = config.fetch ?? fetch;
  }

  /**
   * Makes an authenticated API request.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    retries = this.retryAttempts
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchFn(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json: ApiResponse<T> = await response.json();

      if (!response.ok || !json.success) {
        const error = json.error;
        throw errorFromStatus(
          response.status,
          error?.message ?? 'Request failed',
          error?.details
        );
      }

      return json.data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Don't retry on abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out');
      }

      // Don't retry on auth errors
      if (error instanceof AuthenticationError) {
        throw error;
      }

      // Retry on network errors
      if (error instanceof NetworkError && retries > 0) {
        await this.sleep(this.retryDelay);
        return this.request<T>(method, path, body, retries - 1);
      }

      // Wrap other errors
      if (error instanceof AgentOTPError) {
        throw error;
      }

      throw new NetworkError(
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Sleeps for the specified duration.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Requests a new permission for an operation.
   *
   * @example
   * ```typescript
   * const permission = await client.requestPermission({
   *   action: 'gmail.send',
   *   resource: 'email:recipient@example.com',
   *   scope: { max_emails: 1 },
   *   context: { reason: 'Sending invoice' },
   *   waitForApproval: true,
   * });
   *
   * if (permission.status === 'approved') {
   *   // Use permission.token
   * }
   * ```
   */
  async requestPermission(
    options: RequestPermissionOptions
  ): Promise<PermissionResult> {
    const {
      action,
      resource,
      scope = {},
      context = {},
      ttl = TOKEN_DEFAULTS.DEFAULT_TTL_SECONDS,
      waitForApproval = false,
      timeout = 60000,
      onPendingApproval,
      pollingInterval = DEFAULT_POLLING_INTERVAL,
    } = options;

    // Make the initial request
    const result = await this.request<PermissionResult>(
      'POST',
      '/api/v1/permissions/request',
      { action, resource, scope, context, ttl }
    );

    // Return immediately if auto-approved or denied
    if (
      result.status === PERMISSION_STATUS.APPROVED ||
      result.status === PERMISSION_STATUS.DENIED
    ) {
      if (result.status === PERMISSION_STATUS.DENIED) {
        throw new PermissionDeniedError(
          result.reason ?? 'Permission denied',
          result.reason
        );
      }
      return result;
    }

    // If not waiting for approval, return the pending result
    if (!waitForApproval) {
      return result;
    }

    // Notify callback about pending approval
    if (onPendingApproval && result.approvalUrl && result.webhookUrl) {
      onPendingApproval({
        permissionId: result.id,
        approvalUrl: result.approvalUrl,
        webhookUrl: result.webhookUrl,
        expiresAt: result.expiresAt,
      });
    }

    // Poll for status changes
    const startTime = Date.now();
    const expiresAt = new Date(result.expiresAt).getTime();

    while (true) {
      // Check timeout
      const elapsed = Date.now() - startTime;
      if (elapsed >= timeout) {
        throw new TimeoutError('Waiting for approval timed out');
      }

      // Check expiration
      if (Date.now() >= expiresAt) {
        throw new PermissionExpiredError('Permission request expired');
      }

      // Wait before polling
      await this.sleep(pollingInterval);

      // Check status
      const status = await this.getPermissionStatus(result.id);

      if (status.status === PERMISSION_STATUS.APPROVED) {
        return status;
      }

      if (status.status === PERMISSION_STATUS.DENIED) {
        throw new PermissionDeniedError(
          status.reason ?? 'Permission denied',
          status.reason
        );
      }

      if (status.status === PERMISSION_STATUS.EXPIRED) {
        throw new PermissionExpiredError('Permission request expired');
      }

      // Still pending, continue polling
    }
  }

  /**
   * Gets the current status of a permission request.
   */
  async getPermissionStatus(permissionId: string): Promise<PermissionResult> {
    return this.request<PermissionResult>(
      'GET',
      `/api/v1/permissions/${permissionId}`
    );
  }

  /**
   * Verifies a token is still valid without consuming it.
   *
   * @example
   * ```typescript
   * const result = await client.verifyToken(permissionId, token);
   * if (result.valid) {
   *   console.log(`Token has ${result.usesRemaining} uses left`);
   * }
   * ```
   */
  async verifyToken(
    permissionId: string,
    token: string
  ): Promise<TokenVerificationResult> {
    return this.request<TokenVerificationResult>(
      'POST',
      `/api/v1/permissions/${permissionId}/verify`,
      { token }
    );
  }

  /**
   * Consumes a token, marking it as used.
   *
   * @example
   * ```typescript
   * const result = await client.useToken(permissionId, token, {
   *   actionDetails: {
   *     recipient: 'user@example.com',
   *     subject: 'Invoice #123',
   *   },
   * });
   *
   * if (result.success) {
   *   console.log(`Uses remaining: ${result.usesRemaining}`);
   * }
   * ```
   */
  async useToken(
    permissionId: string,
    token: string,
    input?: UseTokenInput
  ): Promise<TokenUsageResult> {
    return this.request<TokenUsageResult>(
      'POST',
      `/api/v1/permissions/${permissionId}/use`,
      { token, actionDetails: input?.actionDetails }
    );
  }

  /**
   * Helper method that requests permission and automatically uses the token.
   * Useful for one-shot operations.
   *
   * @example
   * ```typescript
   * const result = await client.executeWithPermission(
   *   {
   *     action: 'gmail.send',
   *     resource: 'email:user@example.com',
   *     scope: { max_emails: 1 },
   *     waitForApproval: true,
   *   },
   *   async (token, scope) => {
   *     // Your protected operation here
   *     return await sendEmail({ to: 'user@example.com', token });
   *   }
   * );
   * ```
   */
  async executeWithPermission<T>(
    options: RequestPermissionOptions,
    operation: (
      token: string,
      scope: Record<string, unknown>
    ) => Promise<T>
  ): Promise<T> {
    // Request permission
    const permission = await this.requestPermission({
      ...options,
      waitForApproval: options.waitForApproval ?? true,
    });

    if (permission.status !== PERMISSION_STATUS.APPROVED || !permission.token) {
      throw new PermissionDeniedError('Permission not approved');
    }

    try {
      // Execute the operation
      const result = await operation(permission.token, permission.scope ?? {});

      // Mark token as used
      await this.useToken(permission.id, permission.token);

      return result;
    } catch (error) {
      // Still mark token as used even on error
      try {
        await this.useToken(permission.id, permission.token);
      } catch {
        // Ignore errors when marking as used
      }
      throw error;
    }
  }
}
