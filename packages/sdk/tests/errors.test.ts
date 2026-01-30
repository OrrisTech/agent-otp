/**
 * Tests for SDK error classes.
 *
 * Agent OTP Relay - Secure OTP relay for AI agents.
 */

import { describe, it, expect } from 'vitest';
import {
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
      const details = { field: 'test' };
      const error = new AgentOTPError('Test error', 'TEST_CODE', details);
      expect(error.details).toEqual(details);
    });

    it('should be instanceof Error', () => {
      const error = new AgentOTPError('Test', 'TEST');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AgentOTPError);
    });
  });

  describe('AuthenticationError', () => {
    it('should use default message', () => {
      const error = new AuthenticationError();
      expect(error.message).toBe('Invalid or missing API key');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('API key expired');
      expect(error.message).toBe('API key expired');
    });
  });

  describe('ValidationError', () => {
    it('should use default message', () => {
      const error = new ValidationError();
      expect(error.message).toBe('Validation error');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.name).toBe('ValidationError');
    });

    it('should accept details', () => {
      const details = { field: 'email', error: 'Invalid format' };
      const error = new ValidationError('Invalid input', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('RateLimitError', () => {
    it('should use default message', () => {
      const error = new RateLimitError();
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.name).toBe('RateLimitError');
    });

    it('should accept retry after', () => {
      const error = new RateLimitError('Too many requests', 30);
      expect(error.retryAfter).toBe(30);
    });
  });

  describe('TimeoutError', () => {
    it('should use default message', () => {
      const error = new TimeoutError();
      expect(error.message).toBe('Request timed out');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.name).toBe('TimeoutError');
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

  // OTP-specific errors

  describe('OTPNotFoundError', () => {
    it('should use default message', () => {
      const error = new OTPNotFoundError();
      expect(error.message).toBe('No matching OTP found');
      expect(error.code).toBe('OTP_NOT_FOUND');
      expect(error.name).toBe('OTPNotFoundError');
    });
  });

  describe('OTPExpiredError', () => {
    it('should use default message', () => {
      const error = new OTPExpiredError();
      expect(error.message).toBe('OTP request has expired');
      expect(error.code).toBe('OTP_EXPIRED');
      expect(error.name).toBe('OTPExpiredError');
    });

    it('should accept expiredAt timestamp', () => {
      const error = new OTPExpiredError('Request expired', '2024-01-01T00:00:00Z');
      expect(error.expiredAt).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('OTPAlreadyConsumedError', () => {
    it('should use default message', () => {
      const error = new OTPAlreadyConsumedError();
      expect(error.message).toBe('OTP has already been consumed');
      expect(error.code).toBe('OTP_ALREADY_CONSUMED');
      expect(error.name).toBe('OTPAlreadyConsumedError');
    });

    it('should accept consumedAt timestamp', () => {
      const error = new OTPAlreadyConsumedError('Already used', '2024-01-01T00:00:00Z');
      expect(error.consumedAt).toBe('2024-01-01T00:00:00Z');
    });
  });

  describe('OTPApprovalDeniedError', () => {
    it('should use default message', () => {
      const error = new OTPApprovalDeniedError();
      expect(error.message).toBe('User denied OTP access');
      expect(error.code).toBe('OTP_APPROVAL_DENIED');
      expect(error.name).toBe('OTPApprovalDeniedError');
    });

    it('should accept reason', () => {
      const error = new OTPApprovalDeniedError('Access denied', 'Not authorized');
      expect(error.reason).toBe('Not authorized');
    });
  });

  describe('OTPCancelledError', () => {
    it('should use default message', () => {
      const error = new OTPCancelledError();
      expect(error.message).toBe('OTP request was cancelled');
      expect(error.code).toBe('OTP_CANCELLED');
      expect(error.name).toBe('OTPCancelledError');
    });
  });

  describe('DecryptionError', () => {
    it('should use default message', () => {
      const error = new DecryptionError();
      expect(error.message).toBe('Failed to decrypt OTP payload');
      expect(error.code).toBe('DECRYPTION_ERROR');
      expect(error.name).toBe('DecryptionError');
    });
  });
});

describe('errorFromStatus', () => {
  it('should return AuthenticationError for 401', () => {
    const error = errorFromStatus(401, 'Unauthorized');
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Unauthorized');
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
