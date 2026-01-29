/**
 * Tests for the Policy Engine service.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyEngine } from '../../src/services/policy-engine';
import { POLICY_ACTION } from '@orrisai/agent-otp-shared';

// Mock database client
const createMockDb = (policies: unknown[]) => {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: policies, error: null })),
          })),
        })),
      })),
    })),
  } as unknown as Parameters<typeof PolicyEngine.prototype['evaluate']>[0] extends infer T
    ? T extends { from: unknown }
      ? Parameters<ConstructorParameters<typeof PolicyEngine>[0]['from']>[0]
      : never
    : never;
};

describe('PolicyEngine', () => {
  describe('evaluate', () => {
    it('should return require_approval when no policies match', async () => {
      const mockDb = createMockDb([]);
      const engine = new PolicyEngine(mockDb as any);

      const result = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'unknown.action',
        scope: {},
        context: {},
      });

      expect(result.action).toBe(POLICY_ACTION.REQUIRE_APPROVAL);
      expect(result.reason).toContain('No matching policy');
    });

    it('should match policy with equals condition', async () => {
      const policies = [
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: null,
          name: 'Auto-approve file reads',
          priority: 10,
          conditions: { action: { equals: 'file.read' } },
          action: POLICY_ACTION.AUTO_APPROVE,
          scope_template: null,
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      const result = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'file.read',
        scope: {},
        context: {},
      });

      expect(result.action).toBe(POLICY_ACTION.AUTO_APPROVE);
      expect(result.policy?.name).toBe('Auto-approve file reads');
    });

    it('should match policy with startsWith condition', async () => {
      const policies = [
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: null,
          name: 'Deny bank operations',
          priority: 100,
          conditions: { action: { startsWith: 'bank.' } },
          action: POLICY_ACTION.DENY,
          scope_template: null,
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      const result = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'bank.transfer',
        scope: {},
        context: {},
      });

      expect(result.action).toBe(POLICY_ACTION.DENY);
    });

    it('should match policy with regex condition', async () => {
      const policies = [
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: null,
          name: 'Auto-approve internal emails',
          priority: 10,
          conditions: {
            action: { equals: 'gmail.send' },
            'context.recipient': { matches: '.*@mycompany\\.com$' },
          },
          action: POLICY_ACTION.AUTO_APPROVE,
          scope_template: null,
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      // Should match internal email
      const result1 = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'gmail.send',
        scope: {},
        context: { recipient: 'colleague@mycompany.com' },
      });
      expect(result1.action).toBe(POLICY_ACTION.AUTO_APPROVE);

      // Should not match external email
      const result2 = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'gmail.send',
        scope: {},
        context: { recipient: 'external@other.com' },
      });
      expect(result2.action).toBe(POLICY_ACTION.REQUIRE_APPROVAL);
    });

    it('should match policy with numeric comparison', async () => {
      const policies = [
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: null,
          name: 'Auto-approve small transfers',
          priority: 10,
          conditions: {
            action: { equals: 'bank.transfer' },
            'scope.amount': { lessThan: 100 },
          },
          action: POLICY_ACTION.AUTO_APPROVE,
          scope_template: null,
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      // Small transfer should match
      const result1 = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'bank.transfer',
        scope: { amount: 50 },
        context: {},
      });
      expect(result1.action).toBe(POLICY_ACTION.AUTO_APPROVE);

      // Large transfer should not match
      const result2 = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'bank.transfer',
        scope: { amount: 500 },
        context: {},
      });
      expect(result2.action).toBe(POLICY_ACTION.REQUIRE_APPROVAL);
    });

    it('should evaluate policies in priority order', async () => {
      // Policies should be sorted by priority descending (as the DB would return them)
      const policies = [
        {
          id: 'policy_2',
          user_id: 'user_123',
          agent_id: null,
          name: 'Allow file operations',
          priority: 10,
          conditions: { action: { startsWith: 'file.' } },
          action: POLICY_ACTION.AUTO_APPROVE,
          scope_template: null,
          is_active: true,
        },
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: null,
          name: 'Default deny',
          priority: -1000,
          conditions: {},
          action: POLICY_ACTION.DENY,
          scope_template: null,
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      // File operation should match higher priority policy
      const result1 = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'file.read',
        scope: {},
        context: {},
      });
      expect(result1.action).toBe(POLICY_ACTION.AUTO_APPROVE);

      // Unknown operation should match default deny
      const result2 = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'unknown.action',
        scope: {},
        context: {},
      });
      expect(result2.action).toBe(POLICY_ACTION.DENY);
    });

    it('should apply scope template when policy matches', async () => {
      const policies = [
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: null,
          name: 'Auto-approve with limits',
          priority: 10,
          conditions: { action: { equals: 'gmail.send' } },
          action: POLICY_ACTION.AUTO_APPROVE,
          scope_template: {
            max_emails: 5,
            max_attachment_size: 1048576,
          },
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      const result = await engine.evaluate('user_123', {
        agentId: 'agent_123',
        action: 'gmail.send',
        scope: { max_emails: 1 },
        context: {},
      });

      expect(result.action).toBe(POLICY_ACTION.AUTO_APPROVE);
      expect(result.scope).toEqual({
        max_emails: 5, // Template overrides request
        max_attachment_size: 1048576, // Added from template
      });
    });

    it('should filter policies by agent when agent_id is specified', async () => {
      const policies = [
        {
          id: 'policy_1',
          user_id: 'user_123',
          agent_id: 'agent_specific',
          name: 'Agent-specific policy',
          priority: 100,
          conditions: { action: { equals: 'test.action' } },
          action: POLICY_ACTION.DENY,
          scope_template: null,
          is_active: true,
        },
        {
          id: 'policy_2',
          user_id: 'user_123',
          agent_id: null, // Global policy
          name: 'Global allow',
          priority: 10,
          conditions: { action: { equals: 'test.action' } },
          action: POLICY_ACTION.AUTO_APPROVE,
          scope_template: null,
          is_active: true,
        },
      ];

      const mockDb = createMockDb(policies);
      const engine = new PolicyEngine(mockDb as any);

      // Specific agent should hit agent-specific policy
      const result1 = await engine.evaluate('user_123', {
        agentId: 'agent_specific',
        action: 'test.action',
        scope: {},
        context: {},
      });
      expect(result1.action).toBe(POLICY_ACTION.DENY);

      // Other agent should hit global policy
      const result2 = await engine.evaluate('user_123', {
        agentId: 'agent_other',
        action: 'test.action',
        scope: {},
        context: {},
      });
      expect(result2.action).toBe(POLICY_ACTION.AUTO_APPROVE);
    });
  });
});
