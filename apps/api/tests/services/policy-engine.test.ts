/**
 * Tests for the auto-approval rules engine.
 *
 * NOTE: The policy engine has been simplified for the OTP Relay pivot.
 * Complex policy rules have been replaced with simple auto-approval rules.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PolicyEngine, createPolicyEngine } from '../../src/services/policy-engine';

// Mock Supabase client
const mockDb = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue({ data: [], error: null }),
};

describe('PolicyEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluate', () => {
    it('should return require_approval when no rules are configured', async () => {
      const engine = createPolicyEngine(mockDb as any);

      const result = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        reason: 'Test OTP request',
        expectedSender: 'test@example.com',
      });

      expect(result.decision).toBe('require_approval');
      expect(result.reason).toContain('manual approval');
    });

    it('should always require approval in current implementation', async () => {
      const engine = createPolicyEngine(mockDb as any);

      const result = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        reason: 'Sign up for Acme',
        expectedSender: 'Acme',
        filter: {
          sources: ['email'],
          senderPattern: '*@acme.com',
        },
      });

      // Current implementation always requires approval
      expect(result.decision).toBe('require_approval');
    });
  });

  // TODO: Add tests for auto-approval rules when implemented
  describe.skip('auto-approval rules', () => {
    it('should auto-approve when sender matches trusted pattern', async () => {
      // To be implemented
    });

    it('should deny when sender is blacklisted', async () => {
      // To be implemented
    });
  });
});
