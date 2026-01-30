/**
 * Tests for the OTP storage service.
 *
 * NOTE: The token service has been refactored for the OTP Relay pivot.
 * Old token-based methods have been replaced with OTP payload management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenService, createTokenService } from '../../src/services/token-service';

// Mock Redis client
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};

// Mock Supabase client
const mockDb = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe('TokenService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.del.mockResolvedValue(1);
  });

  describe('storeEncryptedOTP', () => {
    it('should store encrypted OTP in Redis', async () => {
      const service = createTokenService(mockDb as any, mockRedis as any);

      await service.storeEncryptedOTP({
        requestId: 'otp_123',
        encryptedPayload: 'encrypted_data',
        source: 'email',
        sender: 'test@acme.com',
      });

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining('otp_123'),
        expect.stringContaining('encrypted_data'),
        expect.objectContaining({ ex: expect.any(Number) })
      );
    });

    it('should use default TTL when not provided', async () => {
      const service = createTokenService(mockDb as any, mockRedis as any);

      await service.storeEncryptedOTP({
        requestId: 'otp_123',
        encryptedPayload: 'encrypted_data',
        source: 'sms',
      });

      // Should use default TTL (300 seconds)
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ ex: expect.any(Number) })
      );
    });
  });

  describe('consumeEncryptedOTP', () => {
    it('should retrieve and delete OTP from Redis', async () => {
      const storedData = JSON.stringify({
        id: 'otp_123',
        requestId: 'otp_123',
        encryptedPayload: 'encrypted_data',
        source: 'email',
        sender: 'test@acme.com',
        expiresAt: new Date(Date.now() + 60000).toISOString(),
      });

      mockRedis.get.mockResolvedValueOnce(storedData);

      const service = createTokenService(mockDb as any, mockRedis as any);

      const result = await service.consumeEncryptedOTP('otp_123');

      expect(result).not.toBeNull();
      expect(result?.encryptedPayload).toBe('encrypted_data');
      expect(result?.source).toBe('email');
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should return null when OTP not found', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const service = createTokenService(mockDb as any, mockRedis as any);

      const result = await service.consumeEncryptedOTP('otp_nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when OTP has expired', async () => {
      const expiredData = JSON.stringify({
        id: 'otp_123',
        requestId: 'otp_123',
        encryptedPayload: 'encrypted_data',
        source: 'email',
        expiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
      });

      mockRedis.get.mockResolvedValueOnce(expiredData);

      const service = createTokenService(mockDb as any, mockRedis as any);

      const result = await service.consumeEncryptedOTP('otp_123');

      expect(result).toBeNull();
      expect(mockRedis.del).toHaveBeenCalled(); // Should clean up expired data
    });
  });

  describe('legacy methods', () => {
    it('verifyToken should return deprecated message', async () => {
      const service = createTokenService(mockDb as any, mockRedis as any);

      const result = await service.verifyToken('token', 'request_id');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('deprecated');
    });

    it('useToken should return deprecated message', async () => {
      const service = createTokenService(mockDb as any, mockRedis as any);

      const result = await service.useToken('token', 'request_id');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('deprecated');
    });

    it('createToken should throw deprecation error', async () => {
      const service = createTokenService(mockDb as any, mockRedis as any);

      await expect(
        service.createToken({
          permissionRequestId: 'id',
          scope: {},
        })
      ).rejects.toThrow('deprecated');
    });
  });
});
