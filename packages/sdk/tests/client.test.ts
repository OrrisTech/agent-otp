/**
 * Tests for the Agent OTP SDK client.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentOTPClient } from '../src/client';
import {
  AuthenticationError,
  PermissionDeniedError,
  TimeoutError,
} from '../src/errors';
import { PERMISSION_STATUS } from '@orrisai/agent-otp-shared';

describe('AgentOTPClient', () => {
  const mockApiKey = 'ak_test_api_key_12345678901234567890';
  const mockBaseUrl = 'https://api.test.agentotp.com';

  // Mock fetch function
  const createMockFetch = (responses: Array<{ status: number; body: unknown }>) => {
    let callIndex = 0;
    return vi.fn(async () => {
      const response = responses[callIndex] ?? responses[responses.length - 1];
      callIndex++;
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        json: async () => response.body,
      } as Response;
    });
  };

  describe('constructor', () => {
    it('should throw AuthenticationError when API key is missing', () => {
      expect(() => new AgentOTPClient({ apiKey: '' })).toThrow(
        AuthenticationError
      );
    });

    it('should create client with valid config', () => {
      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
      });
      expect(client).toBeInstanceOf(AgentOTPClient);
    });

    it('should use default base URL when not provided', () => {
      const client = new AgentOTPClient({ apiKey: mockApiKey });
      expect(client).toBeInstanceOf(AgentOTPClient);
    });
  });

  describe('requestPermission', () => {
    it('should return approved permission immediately when auto-approved', async () => {
      const mockFetch = createMockFetch([
        {
          status: 201,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.APPROVED,
              token: 'otp_test_token',
              scope: { max_emails: 1 },
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      const result = await client.requestPermission({
        action: 'gmail.send',
        resource: 'email:test@example.com',
        scope: { max_emails: 1 },
      });

      expect(result.status).toBe(PERMISSION_STATUS.APPROVED);
      expect(result.token).toBe('otp_test_token');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw PermissionDeniedError when denied', async () => {
      const mockFetch = createMockFetch([
        {
          status: 200,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.DENIED,
              reason: 'Policy violation',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      await expect(
        client.requestPermission({
          action: 'bank.transfer',
          scope: { amount: 1000000 },
        })
      ).rejects.toThrow(PermissionDeniedError);
    });

    it('should return pending status when waitForApproval is false', async () => {
      const mockFetch = createMockFetch([
        {
          status: 202,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.PENDING,
              approvalUrl: 'https://app.agentotp.com/approve/perm_123',
              webhookUrl: 'wss://api.agentotp.com/ws/perm_123',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      const result = await client.requestPermission({
        action: 'gmail.send',
        waitForApproval: false,
      });

      expect(result.status).toBe(PERMISSION_STATUS.PENDING);
      expect(result.approvalUrl).toBeDefined();
    });

    it('should poll for approval when waitForApproval is true', async () => {
      const mockFetch = createMockFetch([
        // Initial request - pending
        {
          status: 202,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.PENDING,
              approvalUrl: 'https://app.agentotp.com/approve/perm_123',
              webhookUrl: 'wss://api.agentotp.com/ws/perm_123',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
        // First poll - still pending
        {
          status: 200,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.PENDING,
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
        // Second poll - approved
        {
          status: 200,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.APPROVED,
              token: 'otp_test_token',
              scope: { max_emails: 1 },
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      const onPendingApproval = vi.fn();

      const result = await client.requestPermission({
        action: 'gmail.send',
        waitForApproval: true,
        pollingInterval: 10, // Short interval for testing
        onPendingApproval,
      });

      expect(result.status).toBe(PERMISSION_STATUS.APPROVED);
      expect(result.token).toBe('otp_test_token');
      expect(onPendingApproval).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should throw TimeoutError when waiting too long', async () => {
      const mockFetch = createMockFetch([
        {
          status: 202,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.PENDING,
              approvalUrl: 'https://app.agentotp.com/approve/perm_123',
              webhookUrl: 'wss://api.agentotp.com/ws/perm_123',
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
        // Always return pending
        {
          status: 200,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.PENDING,
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      await expect(
        client.requestPermission({
          action: 'gmail.send',
          waitForApproval: true,
          timeout: 50, // Very short timeout
          pollingInterval: 10,
        })
      ).rejects.toThrow(TimeoutError);
    });
  });

  describe('verifyToken', () => {
    it('should return valid token info', async () => {
      const mockFetch = createMockFetch([
        {
          status: 200,
          body: {
            success: true,
            data: {
              valid: true,
              scope: { max_emails: 1 },
              usesRemaining: 1,
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      const result = await client.verifyToken('perm_123', 'otp_test_token');

      expect(result.valid).toBe(true);
      expect(result.usesRemaining).toBe(1);
    });
  });

  describe('useToken', () => {
    it('should successfully consume a token', async () => {
      const mockFetch = createMockFetch([
        {
          status: 200,
          body: {
            success: true,
            data: {
              success: true,
              usesRemaining: 0,
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      const result = await client.useToken('perm_123', 'otp_test_token', {
        actionDetails: { recipient: 'test@example.com' },
      });

      expect(result.success).toBe(true);
      expect(result.usesRemaining).toBe(0);
    });
  });

  describe('executeWithPermission', () => {
    it('should execute operation with approved permission', async () => {
      const mockFetch = createMockFetch([
        // Request permission - auto-approved
        {
          status: 201,
          body: {
            success: true,
            data: {
              id: 'perm_123',
              status: PERMISSION_STATUS.APPROVED,
              token: 'otp_test_token',
              scope: { max_emails: 1 },
              expiresAt: new Date(Date.now() + 300000).toISOString(),
            },
          },
        },
        // Use token
        {
          status: 200,
          body: {
            success: true,
            data: {
              success: true,
              usesRemaining: 0,
            },
          },
        },
      ]);

      const client = new AgentOTPClient({
        apiKey: mockApiKey,
        baseUrl: mockBaseUrl,
        fetch: mockFetch,
      });

      const operation = vi.fn(async (token, scope) => {
        expect(token).toBe('otp_test_token');
        expect(scope).toEqual({ max_emails: 1 });
        return { sent: true };
      });

      const result = await client.executeWithPermission(
        {
          action: 'gmail.send',
          scope: { max_emails: 1 },
        },
        operation
      );

      expect(result).toEqual({ sent: true });
      expect(operation).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
