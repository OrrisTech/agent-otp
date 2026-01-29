/**
 * Tests for the Token Service.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenService } from '../../src/services/token-service';
import { PERMISSION_STATUS } from '@orrisai/agent-otp-shared';

// Mock the crypto module
vi.mock('../../src/lib/crypto', () => ({
  hashSHA256: vi.fn(async (input: string) => `hashed_${input}`),
}));

// Mock the utils module
vi.mock('../../src/lib/utils', () => ({
  generateOtpToken: vi.fn(() => 'otp_test_token_123456789'),
  calculateExpiresAt: vi.fn(
    (ttlSeconds: number) => new Date(Date.now() + ttlSeconds * 1000)
  ),
  toISOString: vi.fn((date: Date) => date.toISOString()),
  isExpired: vi.fn((dateStr: string) => new Date(dateStr) < new Date()),
}));

// Mock Redis client
const createMockRedis = () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
});

// Mock DB client
const createMockDb = () => ({
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() =>
          Promise.resolve({ data: { id: 'token_123' }, error: null })
        ),
      })),
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          is: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({
                data: {
                  id: 'token_123',
                  permission_request_id: 'perm_123',
                  scope: { max_emails: 1 },
                  uses_remaining: 1,
                  expires_at: new Date(Date.now() + 300000).toISOString(),
                },
                error: null,
              })
            ),
          })),
        })),
        is: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
});

describe('TokenService', () => {
  let tokenService: TokenService;
  let mockDb: ReturnType<typeof createMockDb>;
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    mockRedis = createMockRedis();
    tokenService = new TokenService(mockDb as any, mockRedis as any);
  });

  describe('createToken', () => {
    it('should create a token and store it in database and cache', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const token = await tokenService.createToken({
        permissionRequestId: 'perm_123',
        scope: { max_emails: 1 },
        ttlSeconds: 300,
      });

      expect(token).toBe('otp_test_token_123456789');
      expect(mockDb.from).toHaveBeenCalledWith('tokens');
      expect(mockRedis.set).toHaveBeenCalled();
    });

    it('should use default values for ttl and uses when not provided', async () => {
      mockRedis.set.mockResolvedValue('OK');

      const token = await tokenService.createToken({
        permissionRequestId: 'perm_123',
        scope: {},
      });

      expect(token).toBeDefined();
    });

    it('should throw error when database insert fails', async () => {
      const failingDb = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: null,
                  error: { message: 'Database error' },
                })
              ),
            })),
          })),
        })),
      };

      const service = new TokenService(failingDb as any, mockRedis as any);

      await expect(
        service.createToken({
          permissionRequestId: 'perm_123',
          scope: {},
        })
      ).rejects.toThrow('Failed to create token');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token from cache', async () => {
      const cachedData = JSON.stringify({
        id: 'token_123',
        permissionRequestId: 'perm_123',
        scope: { max_emails: 1 },
        usesRemaining: 1,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      });
      mockRedis.get.mockResolvedValue(cachedData);

      // Mock isExpired to return false for valid token
      const { isExpired } = await import('../../src/lib/utils');
      (isExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await tokenService.verifyToken(
        'otp_test_token',
        'perm_123'
      );

      expect(result.valid).toBe(true);
      expect(result.scope).toEqual({ max_emails: 1 });
      expect(result.usesRemaining).toBe(1);
    });

    it('should return invalid when permission request ID does not match', async () => {
      const cachedData = JSON.stringify({
        id: 'token_123',
        permissionRequestId: 'perm_different',
        scope: {},
        usesRemaining: 1,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      });
      mockRedis.get.mockResolvedValue(cachedData);

      const result = await tokenService.verifyToken(
        'otp_test_token',
        'perm_123'
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('does not match');
    });

    it('should return invalid when token has expired', async () => {
      const cachedData = JSON.stringify({
        id: 'token_123',
        permissionRequestId: 'perm_123',
        scope: {},
        usesRemaining: 1,
        expiresAt: new Date(Date.now() - 1000).toISOString(),
      });
      mockRedis.get.mockResolvedValue(cachedData);

      // Mock isExpired to return true
      const { isExpired } = await import('../../src/lib/utils');
      (isExpired as ReturnType<typeof vi.fn>).mockReturnValue(true);

      const result = await tokenService.verifyToken(
        'otp_test_token',
        'perm_123'
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('should return invalid when token has been fully consumed', async () => {
      const cachedData = JSON.stringify({
        id: 'token_123',
        permissionRequestId: 'perm_123',
        scope: {},
        usesRemaining: 0,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      });
      mockRedis.get.mockResolvedValue(cachedData);

      // Mock isExpired to return false
      const { isExpired } = await import('../../src/lib/utils');
      (isExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await tokenService.verifyToken(
        'otp_test_token',
        'perm_123'
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('consumed');
    });

    it('should fallback to database when not in cache', async () => {
      mockRedis.get.mockResolvedValue(null);

      // Mock isExpired to return false
      const { isExpired } = await import('../../src/lib/utils');
      (isExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await tokenService.verifyToken(
        'otp_test_token',
        'perm_123'
      );

      expect(result.valid).toBe(true);
      expect(mockDb.from).toHaveBeenCalledWith('tokens');
    });

    it('should return invalid when token not found in database', async () => {
      mockRedis.get.mockResolvedValue(null);

      const noResultDb = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                is: vi.fn(() => ({
                  single: vi.fn(() =>
                    Promise.resolve({
                      data: null,
                      error: { message: 'Not found' },
                    })
                  ),
                })),
              })),
            })),
          })),
        })),
      };

      const service = new TokenService(noResultDb as any, mockRedis as any);

      const result = await service.verifyToken('otp_test_token', 'perm_123');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not found');
    });
  });

  describe('useToken', () => {
    it('should successfully consume a token', async () => {
      // Setup cache to have valid token
      const cachedData = JSON.stringify({
        id: 'token_123',
        permissionRequestId: 'perm_123',
        scope: { max_emails: 1 },
        usesRemaining: 1,
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      });
      mockRedis.get.mockResolvedValue(cachedData);
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.del.mockResolvedValue(1);

      // Mock isExpired to return false
      const { isExpired } = await import('../../src/lib/utils');
      (isExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await tokenService.useToken(
        'otp_test_token',
        'perm_123',
        { actionDetails: { recipient: 'test@example.com' } }
      );

      expect(result.success).toBe(true);
      expect(result.usesRemaining).toBe(0);
    });

    it('should return failure when token verification fails', async () => {
      mockRedis.get.mockResolvedValue(null);

      const noResultDb = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                is: vi.fn(() => ({
                  single: vi.fn(() =>
                    Promise.resolve({
                      data: null,
                      error: { message: 'Not found' },
                    })
                  ),
                })),
              })),
            })),
          })),
        })),
      };

      const service = new TokenService(noResultDb as any, mockRedis as any);

      const result = await service.useToken('otp_invalid_token', 'perm_123');

      expect(result.success).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should handle unlimited uses (-1)', async () => {
      const cachedData = JSON.stringify({
        id: 'token_123',
        permissionRequestId: 'perm_123',
        scope: {},
        usesRemaining: -1, // Unlimited
        expiresAt: new Date(Date.now() + 300000).toISOString(),
      });
      mockRedis.get.mockResolvedValue(cachedData);
      mockRedis.set.mockResolvedValue('OK');

      // Mock isExpired to return false
      const { isExpired } = await import('../../src/lib/utils');
      (isExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);

      // Override the DB mock to return -1 uses
      const unlimitedDb = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                is: vi.fn(() => ({
                  single: vi.fn(() =>
                    Promise.resolve({
                      data: {
                        id: 'token_123',
                        uses_remaining: -1,
                      },
                      error: null,
                    })
                  ),
                })),
              })),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      };

      const service = new TokenService(unlimitedDb as any, mockRedis as any);

      const result = await service.useToken('otp_test_token', 'perm_123');

      expect(result.success).toBe(true);
      expect(result.usesRemaining).toBe(-1); // Still unlimited
    });
  });

  describe('revokeToken', () => {
    it('should revoke a token successfully', async () => {
      const revokeDb = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
          })),
        })),
      };
      mockRedis.del.mockResolvedValue(1);

      const service = new TokenService(revokeDb as any, mockRedis as any);

      const result = await service.revokeToken(
        'otp_test_token',
        'perm_123'
      );

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should return false when database update fails', async () => {
      const failingDb = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({ error: { message: 'Update failed' } })
              ),
            })),
          })),
        })),
      };

      const service = new TokenService(failingDb as any, mockRedis as any);

      const result = await service.revokeToken('otp_test_token', 'perm_123');

      expect(result).toBe(false);
    });
  });

  describe('revokeAllTokensForRequest', () => {
    it('should revoke all tokens for a permission request', async () => {
      const tokensDb = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() =>
                Promise.resolve({
                  data: [
                    { token_hash: 'hash_1' },
                    { token_hash: 'hash_2' },
                  ],
                  error: null,
                })
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      };

      mockRedis.del.mockResolvedValue(1);

      const service = new TokenService(tokensDb as any, mockRedis as any);

      await service.revokeAllTokensForRequest('perm_123');

      expect(mockRedis.del).toHaveBeenCalledTimes(2);
    });

    it('should handle empty token list gracefully', async () => {
      const noTokensDb = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              is: vi.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
            })),
          })),
        })),
      };

      const service = new TokenService(noTokensDb as any, mockRedis as any);

      // Should not throw
      await service.revokeAllTokensForRequest('perm_123');

      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });
});
