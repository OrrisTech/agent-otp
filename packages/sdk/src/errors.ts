/**
 * Error classes for the Agent OTP SDK.
 */

/**
 * Base error class for Agent OTP SDK errors.
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
 * Error thrown when authentication fails.
 */
export class AuthenticationError extends AgentOTPError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when access is forbidden.
 */
export class ForbiddenError extends AgentOTPError {
  constructor(message = 'Access denied') {
    super(message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

/**
 * Error thrown when a resource is not found.
 */
export class NotFoundError extends AgentOTPError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when validation fails.
 */
export class ValidationError extends AgentOTPError {
  constructor(
    message = 'Validation failed',
    details?: Record<string, unknown>
  ) {
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
    super(message, 'RATE_LIMITED', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when a permission request times out.
 */
export class TimeoutError extends AgentOTPError {
  constructor(message = 'Request timed out') {
    super(message, 'TIMEOUT');
    this.name = 'TimeoutError';
  }
}

/**
 * Error thrown when a permission is denied.
 */
export class PermissionDeniedError extends AgentOTPError {
  constructor(
    message = 'Permission denied',
    public readonly reason?: string
  ) {
    super(message, 'PERMISSION_DENIED', { reason });
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Error thrown when a permission request expires.
 */
export class PermissionExpiredError extends AgentOTPError {
  constructor(message = 'Permission request expired') {
    super(message, 'PERMISSION_EXPIRED');
    this.name = 'PermissionExpiredError';
  }
}

/**
 * Error thrown when a token is invalid or consumed.
 */
export class InvalidTokenError extends AgentOTPError {
  constructor(message = 'Invalid or consumed token') {
    super(message, 'INVALID_TOKEN');
    this.name = 'InvalidTokenError';
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

/**
 * Error thrown when a token has already been used.
 */
export class TokenUsedError extends AgentOTPError {
  constructor(
    message = 'Token has already been used',
    public readonly usedAt?: string
  ) {
    super(message, 'TOKEN_USED', { usedAt });
    this.name = 'TokenUsedError';
  }
}

/**
 * Error thrown when a token has been revoked.
 */
export class TokenRevokedError extends AgentOTPError {
  constructor(
    message = 'Token has been revoked',
    public readonly revokedBy?: string
  ) {
    super(message, 'TOKEN_REVOKED', { revokedBy });
    this.name = 'TokenRevokedError';
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
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 422:
      return new ValidationError(message, details);
    case 429:
      return new RateLimitError(message);
    default:
      // Handle 5xx server errors
      if (status >= 500 && status < 600) {
        return new ServerError(message, status, details?.requestId as string | undefined);
      }
      return new AgentOTPError(message, 'API_ERROR', { status, details });
  }
}
