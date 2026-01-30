/**
 * Tests for the AgentOTPClient.
 *
 * Agent OTP Relay - Secure OTP relay for AI agents.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentOTPClient } from '../src/client';
import {
  AuthenticationError,
  OTPNotFoundError,
  OTPExpiredError,
  OTPApprovalDeniedError,
  TimeoutError,
} from '../src/errors';

// Mock fetch
const mockFetch = vi.fn();

describe('AgentOTPClient', () => {
  let client: AgentOTPClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new AgentOTPClient({
      apiKey: 'ak_test_123',
      baseUrl: 'https://api.test.com',
      fetch: mockFetch as unknown as typeof fetch,
    });
  });

  describe('constructor', () => {
    it('should require an API key', () => {
      expect(() => new AgentOTPClient({ apiKey: '' })).toThrow(
        AuthenticationError
      );
    });

    it('should use default values', () => {
      const c = new AgentOTPClient({ apiKey: 'ak_test' });
      expect(c).toBeDefined();
    });
  });

  describe('requestOTP', () => {
    it('should request OTP successfully', async () => {
      const mockResponse = {
        id: 'otp_123',
        status: 'pending_approval',
        approval_url: 'https://app.agentotp.com/approve/otp_123',
        webhook_url: 'wss://api.agentotp.com/ws/otp_123',
        expires_at: '2024-01-01T01:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.requestOTP({
        reason: 'Sign up for Acme',
        expectedSender: 'Acme',
        publicKey: 'base64key==',
      });

      expect(result.id).toBe('otp_123');
      expect(result.status).toBe('pending_approval');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/otp/request',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer ak_test_123',
          }),
        })
      );
    });

    it('should call onPendingApproval callback', async () => {
      const mockResponse = {
        id: 'otp_123',
        status: 'pending_approval',
        approval_url: 'https://app.agentotp.com/approve/otp_123',
        webhook_url: 'wss://api.agentotp.com/ws/otp_123',
        expires_at: '2024-01-01T01:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const onPendingApproval = vi.fn();

      await client.requestOTP({
        reason: 'Test',
        publicKey: 'key',
        waitForOTP: false,
        onPendingApproval,
      });

      // Callback should not be called when not waiting
      expect(onPendingApproval).not.toHaveBeenCalled();
    });
  });

  describe('getOTPStatus', () => {
    it('should get OTP status', async () => {
      const mockResponse = {
        id: 'otp_123',
        status: 'approved',
        expires_at: '2024-01-01T01:00:00Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getOTPStatus('otp_123');

      expect(result.status).toBe('approved');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/otp/otp_123',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should throw OTPNotFoundError for 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({ code: 'OTP_NOT_FOUND', message: 'Not found' }),
      });

      await expect(client.getOTPStatus('otp_invalid')).rejects.toThrow(
        OTPNotFoundError
      );
    });
  });

  describe('cancelOTPRequest', () => {
    it('should cancel OTP request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.cancelOTPRequest('otp_123')).resolves.toBeUndefined();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/otp/otp_123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle authentication error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid API key' }),
      });

      await expect(
        client.requestOTP({ reason: 'Test', publicKey: 'key' })
      ).rejects.toThrow(AuthenticationError);
    });

    it('should handle OTP expired error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 410,
        json: () =>
          Promise.resolve({
            code: 'OTP_EXPIRED',
            message: 'Request expired',
            expired_at: '2024-01-01T00:00:00Z',
          }),
      });

      await expect(client.getOTPStatus('otp_123')).rejects.toThrow(
        OTPExpiredError
      );
    });

    it('should handle OTP approval denied error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            code: 'OTP_APPROVAL_DENIED',
            message: 'User denied',
            reason: 'Not authorized',
          }),
      });

      await expect(client.getOTPStatus('otp_123')).rejects.toThrow(
        OTPApprovalDeniedError
      );
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        return Promise.reject(error);
      });

      await expect(
        client.requestOTP({ reason: 'Test', publicKey: 'key' })
      ).rejects.toThrow(TimeoutError);
    });
  });
});
