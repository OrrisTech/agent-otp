/**
 * Tests for Zod schemas validation.
 */

import { describe, it, expect } from 'vitest';
import {
  uuidSchema,
  isoDateStringSchema,
  paginationSchema,
  createUserSchema,
  updateUserSchema,
  createAgentSchema,
  updateAgentSchema,
  policyConditionSchema,
  createPolicySchema,
  updatePolicySchema,
  createPermissionRequestSchema,
  verifyTokenSchema,
  useTokenSchema,
  auditLogFilterSchema,
  approvalDecisionSchema,
} from '../src/schemas';
import { POLICY_ACTION } from '../src/constants';

describe('Base Schemas', () => {
  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(() => uuidSchema.parse(validUuid)).not.toThrow();
    });

    it('should reject invalid UUIDs', () => {
      expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
      expect(() => uuidSchema.parse('')).toThrow();
      expect(() => uuidSchema.parse('123')).toThrow();
    });
  });

  describe('isoDateStringSchema', () => {
    it('should accept valid ISO date strings', () => {
      const validDate = '2024-01-15T12:00:00.000Z';
      expect(() => isoDateStringSchema.parse(validDate)).not.toThrow();
    });

    it('should reject invalid date strings', () => {
      expect(() => isoDateStringSchema.parse('2024-01-15')).toThrow();
      expect(() => isoDateStringSchema.parse('not-a-date')).toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should use default values when not provided', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should accept valid pagination values', () => {
      const result = paginationSchema.parse({ page: 2, limit: 50 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should coerce string values to numbers', () => {
      const result = paginationSchema.parse({ page: '3', limit: '25' });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
    });

    it('should reject invalid pagination values', () => {
      expect(() => paginationSchema.parse({ page: 0 })).toThrow();
      expect(() => paginationSchema.parse({ page: -1 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: 1000 })).toThrow(); // Exceeds max
    });
  });
});

describe('User Schemas', () => {
  describe('createUserSchema', () => {
    it('should accept valid user data', () => {
      const validUser = { email: 'test@example.com' };
      expect(() => createUserSchema.parse(validUser)).not.toThrow();
    });

    it('should accept user with optional fields', () => {
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
      };
      const result = createUserSchema.parse(validUser);
      expect(result.name).toBe('Test User');
    });

    it('should reject invalid email', () => {
      expect(() => createUserSchema.parse({ email: 'not-an-email' })).toThrow();
      expect(() => createUserSchema.parse({ email: '' })).toThrow();
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(256);
      expect(() =>
        createUserSchema.parse({ email: 'test@example.com', name: longName })
      ).toThrow();
    });
  });

  describe('updateUserSchema', () => {
    it('should accept partial updates', () => {
      expect(() => updateUserSchema.parse({})).not.toThrow();
      expect(() =>
        updateUserSchema.parse({ email: 'new@example.com' })
      ).not.toThrow();
      expect(() => updateUserSchema.parse({ name: 'New Name' })).not.toThrow();
    });

    it('should allow null for telegramChatId', () => {
      const result = updateUserSchema.parse({ telegramChatId: null });
      expect(result.telegramChatId).toBeNull();
    });
  });
});

describe('Agent Schemas', () => {
  describe('createAgentSchema', () => {
    it('should accept valid agent data', () => {
      const validAgent = { name: 'My Agent' };
      const result = createAgentSchema.parse(validAgent);
      expect(result.name).toBe('My Agent');
      expect(result.metadata).toEqual({});
    });

    it('should accept agent with all fields', () => {
      const validAgent = {
        name: 'My Agent',
        description: 'A test agent',
        metadata: { version: '1.0' },
      };
      const result = createAgentSchema.parse(validAgent);
      expect(result.description).toBe('A test agent');
      expect(result.metadata).toEqual({ version: '1.0' });
    });

    it('should reject empty name', () => {
      expect(() => createAgentSchema.parse({ name: '' })).toThrow();
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(256);
      expect(() => createAgentSchema.parse({ name: longName })).toThrow();
    });
  });

  describe('updateAgentSchema', () => {
    it('should accept partial updates', () => {
      expect(() => updateAgentSchema.parse({})).not.toThrow();
      expect(() =>
        updateAgentSchema.parse({ isActive: false })
      ).not.toThrow();
    });
  });
});

describe('Policy Schemas', () => {
  describe('policyConditionSchema', () => {
    it('should accept equals condition', () => {
      const condition = { equals: 'gmail.send' };
      expect(() => policyConditionSchema.parse(condition)).not.toThrow();
    });

    it('should accept numeric conditions', () => {
      expect(() =>
        policyConditionSchema.parse({ lessThan: 100 })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ greaterThan: 0 })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ lessThanOrEqual: 50 })
      ).not.toThrow();
    });

    it('should accept string pattern conditions', () => {
      expect(() =>
        policyConditionSchema.parse({ startsWith: 'bank.' })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ endsWith: '.com' })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ contains: '@mycompany' })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ matches: '.*@mycompany\\.com$' })
      ).not.toThrow();
    });

    it('should accept in/notIn conditions', () => {
      expect(() =>
        policyConditionSchema.parse({ in: ['read', 'write', 'delete'] })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ notIn: [1, 2, 3] })
      ).not.toThrow();
    });

    it('should accept exists condition', () => {
      expect(() =>
        policyConditionSchema.parse({ exists: true })
      ).not.toThrow();
      expect(() =>
        policyConditionSchema.parse({ exists: false })
      ).not.toThrow();
    });

    it('should accept multiple conditions', () => {
      const condition = {
        greaterThan: 0,
        lessThan: 100,
      };
      expect(() => policyConditionSchema.parse(condition)).not.toThrow();
    });
  });

  describe('createPolicySchema', () => {
    it('should accept valid policy', () => {
      const validPolicy = {
        name: 'Auto-approve file reads',
        conditions: {
          action: { equals: 'file.read' },
        },
        action: POLICY_ACTION.AUTO_APPROVE,
      };
      expect(() => createPolicySchema.parse(validPolicy)).not.toThrow();
    });

    it('should accept policy with all fields', () => {
      const validPolicy = {
        agentId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Complex policy',
        description: 'A complex policy with multiple conditions',
        priority: 100,
        conditions: {
          action: { startsWith: 'bank.' },
          'scope.amount': { lessThan: 1000 },
        },
        action: POLICY_ACTION.REQUIRE_APPROVAL,
        scopeTemplate: { max_retries: 3 },
      };
      const result = createPolicySchema.parse(validPolicy);
      expect(result.priority).toBe(100);
      expect(result.scopeTemplate).toEqual({ max_retries: 3 });
    });

    it('should use default priority of 0', () => {
      const policy = {
        name: 'Test',
        conditions: {},
        action: POLICY_ACTION.DENY,
      };
      const result = createPolicySchema.parse(policy);
      expect(result.priority).toBe(0);
    });

    it('should reject invalid action', () => {
      expect(() =>
        createPolicySchema.parse({
          name: 'Test',
          conditions: {},
          action: 'invalid_action',
        })
      ).toThrow();
    });
  });

  describe('updatePolicySchema', () => {
    it('should accept partial updates', () => {
      expect(() => updatePolicySchema.parse({})).not.toThrow();
      expect(() => updatePolicySchema.parse({ priority: 50 })).not.toThrow();
      expect(() =>
        updatePolicySchema.parse({ isActive: false })
      ).not.toThrow();
    });

    it('should allow null for scopeTemplate', () => {
      const result = updatePolicySchema.parse({ scopeTemplate: null });
      expect(result.scopeTemplate).toBeNull();
    });
  });
});

describe('Permission Request Schemas', () => {
  describe('createPermissionRequestSchema', () => {
    it('should accept valid permission request', () => {
      const validRequest = {
        action: 'gmail.send',
      };
      const result = createPermissionRequestSchema.parse(validRequest);
      expect(result.action).toBe('gmail.send');
      expect(result.scope).toEqual({});
      expect(result.context).toEqual({});
      expect(result.ttl).toBe(300); // Default TTL
    });

    it('should accept request with all fields', () => {
      const validRequest = {
        action: 'gmail.send',
        resource: 'email:user@example.com',
        scope: { max_emails: 1 },
        context: { reason: 'Sending invoice' },
        ttl: 600,
      };
      const result = createPermissionRequestSchema.parse(validRequest);
      expect(result.resource).toBe('email:user@example.com');
      expect(result.scope).toEqual({ max_emails: 1 });
      expect(result.context).toEqual({ reason: 'Sending invoice' });
      expect(result.ttl).toBe(600);
    });

    it('should reject empty action', () => {
      expect(() =>
        createPermissionRequestSchema.parse({ action: '' })
      ).toThrow();
    });

    it('should reject action exceeding max length', () => {
      const longAction = 'a'.repeat(256);
      expect(() =>
        createPermissionRequestSchema.parse({ action: longAction })
      ).toThrow();
    });

    it('should reject TTL below minimum', () => {
      expect(() =>
        createPermissionRequestSchema.parse({ action: 'test', ttl: 0 })
      ).toThrow();
    });

    it('should reject TTL above maximum', () => {
      expect(() =>
        createPermissionRequestSchema.parse({ action: 'test', ttl: 10000 })
      ).toThrow();
    });
  });
});

describe('Token Schemas', () => {
  describe('verifyTokenSchema', () => {
    it('should accept valid token', () => {
      expect(() =>
        verifyTokenSchema.parse({ token: 'otp_abc123' })
      ).not.toThrow();
    });

    it('should reject empty token', () => {
      expect(() => verifyTokenSchema.parse({ token: '' })).toThrow();
    });
  });

  describe('useTokenSchema', () => {
    it('should accept token only', () => {
      expect(() =>
        useTokenSchema.parse({ token: 'otp_abc123' })
      ).not.toThrow();
    });

    it('should accept token with action details', () => {
      const input = {
        token: 'otp_abc123',
        actionDetails: {
          recipient: 'user@example.com',
          subject: 'Hello',
        },
      };
      const result = useTokenSchema.parse(input);
      expect(result.actionDetails).toEqual({
        recipient: 'user@example.com',
        subject: 'Hello',
      });
    });
  });
});

describe('Audit Log Schemas', () => {
  describe('auditLogFilterSchema', () => {
    it('should accept empty filter', () => {
      expect(() => auditLogFilterSchema.parse({})).not.toThrow();
    });

    it('should accept filter with all fields', () => {
      const filter = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        agentId: '123e4567-e89b-12d3-a456-426614174001',
        eventType: 'request',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
      };
      expect(() => auditLogFilterSchema.parse(filter)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      expect(() =>
        auditLogFilterSchema.parse({ userId: 'not-a-uuid' })
      ).toThrow();
    });

    it('should reject invalid event type', () => {
      expect(() =>
        auditLogFilterSchema.parse({ eventType: 'invalid_event' })
      ).toThrow();
    });
  });
});

describe('Approval Schemas', () => {
  describe('approvalDecisionSchema', () => {
    it('should accept approval decision', () => {
      expect(() =>
        approvalDecisionSchema.parse({ approved: true })
      ).not.toThrow();
      expect(() =>
        approvalDecisionSchema.parse({ approved: false })
      ).not.toThrow();
    });

    it('should accept decision with reason', () => {
      const decision = {
        approved: false,
        reason: 'Not authorized for this operation',
      };
      const result = approvalDecisionSchema.parse(decision);
      expect(result.reason).toBe('Not authorized for this operation');
    });

    it('should accept decision with scope modifications', () => {
      const decision = {
        approved: true,
        scopeModifications: { max_emails: 1 }, // Reduced from requested
      };
      const result = approvalDecisionSchema.parse(decision);
      expect(result.scopeModifications).toEqual({ max_emails: 1 });
    });

    it('should reject reason exceeding max length', () => {
      const longReason = 'a'.repeat(501);
      expect(() =>
        approvalDecisionSchema.parse({ approved: false, reason: longReason })
      ).toThrow();
    });
  });
});
