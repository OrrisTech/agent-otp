/**
 * Error classes for the Agent OTP Relay SDK.
 *
 * Agent OTP is a secure OTP relay service that helps AI agents
 * receive verification codes (SMS/email) with user approval
 * and end-to-end encryption.
 */

/**
 * Base error class for all Agent OTP errors.
 */
export class AgentOTPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentOTPError';
  }
}

/**
 * Error thrown when API key is invalid or missing.
 */
export class AuthenticationError extends AgentOTPError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown for validation failures.
 */
export class ValidationError extends AgentOTPError {
  constructor(message = 'Validation error', details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when rate limit is exceeded.
 */
export class RateLimitError extends AgentOTPError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly retryAfter?: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when a request times out.
 */
export class TimeoutError extends AgentOTPError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

/**
 * Error thrown for network-related issues.
 */
export class NetworkError extends AgentOTPError {
  constructor(message = 'Network request failed', cause?: Error) {
    super(message, 'NETWORK_ERROR', { cause: cause?.message });
    this.name = 'NetworkError';
  }
}

/**
 * Error thrown when the server returns a 5xx error.
 */
export class ServerError extends AgentOTPError {
  constructor(
    message = 'Server error',
    public readonly status: number = 500,
    public readonly requestId?: string
  ) {
    super(message, 'SERVER_ERROR', { status, requestId });
    this.name = 'ServerError';
  }
}

// ============================================================================
// OTP-Specific Errors
// ============================================================================

/**
 * Error thrown when no matching OTP is found.
 */
export class OTPNotFoundError extends AgentOTPError {
  constructor(message = 'No matching OTP found') {
    super(message, 'OTP_NOT_FOUND');
    this.name = 'OTPNotFoundError';
  }
}

/**
 * Error thrown when an OTP request has expired.
 */
export class OTPExpiredError extends AgentOTPError {
  constructor(
    message = 'OTP request has expired',
    public readonly expiredAt?: string
  ) {
    super(message, 'OTP_EXPIRED', { expiredAt });
    this.name = 'OTPExpiredError';
  }
}

/**
 * Error thrown when an OTP has already been consumed.
 */
export class OTPAlreadyConsumedError extends AgentOTPError {
  constructor(
    message = 'OTP has already been consumed',
    public readonly consumedAt?: string
  ) {
    super(message, 'OTP_ALREADY_CONSUMED', { consumedAt });
    this.name = 'OTPAlreadyConsumedError';
  }
}

/**
 * Error thrown when user denies OTP access.
 */
export class OTPApprovalDeniedError extends AgentOTPError {
  constructor(
    message = 'User denied OTP access',
    public readonly reason?: string
  ) {
    super(message, 'OTP_APPROVAL_DENIED', { reason });
    this.name = 'OTPApprovalDeniedError';
  }
}

/**
 * Error thrown when OTP request is cancelled.
 */
export class OTPCancelledError extends AgentOTPError {
  constructor(message = 'OTP request was cancelled') {
    super(message, 'OTP_CANCELLED');
    this.name = 'OTPCancelledError';
  }
}

/**
 * Error thrown when decryption fails.
 */
export class DecryptionError extends AgentOTPError {
  constructor(message = 'Failed to decrypt OTP payload') {
    super(message, 'DECRYPTION_ERROR');
    this.name = 'DecryptionError';
  }
}

/**
 * Maps HTTP status codes to appropriate error classes.
 */
export function errorFromStatus(
  status: number,
  message: string,
  details?: Record<string, unknown>
): AgentOTPError {
  switch (status) {
    case 401:
      return new AuthenticationError(message);
    case 422:
      return new ValidationError(message, details);
    case 429:
      return new RateLimitError(message);
    default:
      // Handle 5xx server errors
      if (status >= 500 && status < 600) {
        return new ServerError(
          message,
          status,
          details?.requestId as string | undefined
        );
      }
      return new AgentOTPError(message, 'API_ERROR', { status, details });
  }
}
