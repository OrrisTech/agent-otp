/**
 * Tests for SDK error classes.
 */

import { describe, it, expect } from 'vitest';
import {
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
  errorFromStatus,
} from '../src/errors';

describe('Error Classes', () => {
  describe('AgentOTPError', () => {
    it('should create error with message and code', () => {
      const error = new AgentOTPError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('AgentOTPError');
    });

    it('should create error with details', () => {
      const details = { field: 'value' };
      const error = new AgentOTPError('Test error', 'TEST_CODE', details);
      expect(error.details).toEqual(details);
    });

    it('should be instanceof Error', () => {
      const error = new AgentOTPError('Test', 'TEST');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('AuthenticationError', () => {
    it('should use default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid API key');
      expect(error.message).toBe('Invalid API key');
    });

    it('should be instanceof AgentOTPError', () => {
      const error = new AuthenticationError();
      expect(error).toBeInstanceOf(AgentOTPError);
    });
  });

  describe('ForbiddenError', () => {
    it('should use default message', () => {
      const error = new ForbiddenError();
      expect(error.message).toBe('Access denied');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.name).toBe('ForbiddenError');
    });

    it('should accept custom message', () => {
      const error = new ForbiddenError('Insufficient permissions');
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('NotFoundError', () => {
    it('should use default message', () => {
      const error = new NotFoundError();
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.name).toBe('NotFoundError');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('Permission request not found');
      expect(error.message).toBe('Permission request not found');
    });
  });

  describe('ValidationError', () => {
    it('should use default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should accept custom message and details', () => {
      const details = { field: 'email', issue: 'invalid format' };
      const error = new ValidationError('Invalid email format', details);
      expect(error.message).toBe('Invalid email format');
      expect(error.details).toEqual(details);
    });
  });

  describe('RateLimitError', () => {
    it('should use default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMITED');
      expect(error.name).toBe('RateLimitError');
    });

    it('should accept retryAfter', () => {
      const error = new RateLimitError('Too many requests', 60);
      expect(error.retryAfter).toBe(60);
      expect(error.details).toEqual({ retryAfter: 60 });
    });
  });

  describe('TimeoutError', () => {
    it('should use default message', () => {
      const error = new TimeoutError();
      expect(error.message).toBe('Request timed out');
      expect(error.code).toBe('TIMEOUT');
      expect(error.name).toBe('TimeoutError');
    });

    it('should accept custom message', () => {
      const error = new TimeoutError('Approval timed out');
      expect(error.message).toBe('Approval timed out');
    });
  });

  describe('PermissionDeniedError', () => {
    it('should use default message', () => {
      const error = new PermissionDeniedError();
      expect(error.message).toBe('Permission denied');
      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.name).toBe('PermissionDeniedError');
    });

    it('should accept reason', () => {
      const error = new PermissionDeniedError(
        'Policy violation',
        'Amount exceeds limit'
      );
      expect(error.reason).toBe('Amount exceeds limit');
      expect(error.details).toEqual({ reason: 'Amount exceeds limit' });
    });
  });

  describe('PermissionExpiredError', () => {
    it('should use default message', () => {
      const error = new PermissionExpiredError();
      expect(error.message).toBe('Permission request expired');
      expect(error.code).toBe('PERMISSION_EXPIRED');
      expect(error.name).toBe('PermissionExpiredError');
    });
  });

  describe('InvalidTokenError', () => {
    it('should use default message', () => {
      const error = new InvalidTokenError();
      expect(error.message).toBe('Invalid or consumed token');
      expect(error.code).toBe('INVALID_TOKEN');
      expect(error.name).toBe('InvalidTokenError');
    });

    it('should accept custom message', () => {
      const error = new InvalidTokenError('Token has been revoked');
      expect(error.message).toBe('Token has been revoked');
    });
  });

  describe('NetworkError', () => {
    it('should use default message', () => {
      const error = new NetworkError();
      expect(error.message).toBe('Network request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
    });

    it('should accept cause error', () => {
      const cause = new Error('Connection refused');
      const error = new NetworkError('Failed to connect', cause);
      expect(error.details).toEqual({ cause: 'Connection refused' });
    });
  });

  describe('ServerError', () => {
    it('should use default values', () => {
      const error = new ServerError();
      expect(error.message).toBe('Server error');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.status).toBe(500);
      expect(error.name).toBe('ServerError');
    });

    it('should accept custom status and requestId', () => {
      const error = new ServerError('Bad Gateway', 502, 'req_123');
      expect(error.status).toBe(502);
      expect(error.requestId).toBe('req_123');
    });
  });

  describe('TokenUsedError', () => {
    it('should use default message', () => {
      const error = new TokenUsedError();
      expect(error.message).toBe('Token has already been used');
      expect(error.code).toBe('TOKEN_USED');
      expect(error.name).toBe('TokenUsedError');
    });

    it('should accept usedAt timestamp', () => {
      const usedAt = '2024-01-01T00:00:00Z';
      const error = new TokenUsedError('Token used', usedAt);
      expect(error.usedAt).toBe(usedAt);
    });
  });

  describe('TokenRevokedError', () => {
    it('should use default message', () => {
      const error = new TokenRevokedError();
      expect(error.message).toBe('Token has been revoked');
      expect(error.code).toBe('TOKEN_REVOKED');
      expect(error.name).toBe('TokenRevokedError');
    });

    it('should accept revokedBy', () => {
      const error = new TokenRevokedError('Token revoked', 'admin@example.com');
      expect(error.revokedBy).toBe('admin@example.com');
    });
  });
});

describe('errorFromStatus', () => {
  it('should return AuthenticationError for 401', () => {
    const error = errorFromStatus(401, 'Unauthorized');
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Unauthorized');
  });

  it('should return ForbiddenError for 403', () => {
    const error = errorFromStatus(403, 'Forbidden');
    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error.message).toBe('Forbidden');
  });

  it('should return NotFoundError for 404', () => {
    const error = errorFromStatus(404, 'Not Found');
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error.message).toBe('Not Found');
  });

  it('should return ValidationError for 422', () => {
    const details = { field: 'email' };
    const error = errorFromStatus(422, 'Invalid input', details);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.details).toEqual(details);
  });

  it('should return RateLimitError for 429', () => {
    const error = errorFromStatus(429, 'Too Many Requests');
    expect(error).toBeInstanceOf(RateLimitError);
  });

  it('should return ServerError for 5xx status codes', () => {
    const error = errorFromStatus(500, 'Internal Server Error');
    expect(error).toBeInstanceOf(ServerError);
    expect(error.code).toBe('SERVER_ERROR');
    expect((error as ServerError).status).toBe(500);
  });

  it('should include requestId in ServerError from details', () => {
    const details = { requestId: 'req_abc123' };
    const error = errorFromStatus(502, 'Bad Gateway', details);
    expect(error).toBeInstanceOf(ServerError);
    expect((error as ServerError).requestId).toBe('req_abc123');
  });

  it('should return generic AgentOTPError for other 4xx status codes', () => {
    const error = errorFromStatus(418, "I'm a teapot");
    expect(error).toBeInstanceOf(AgentOTPError);
    expect(error.code).toBe('API_ERROR');
  });
});
