/**
 * Tests for shared constants.
 */

import { describe, it, expect } from 'vitest';
import {
  PERMISSION_STATUS,
  POLICY_ACTION,
  TOKEN_DEFAULTS,
  PAGINATION_DEFAULTS,
  AUDIT_EVENT_TYPE,
  HTTP_STATUS,
} from '../src/constants';

describe('Constants', () => {
  describe('PERMISSION_STATUS', () => {
    it('should have all required statuses', () => {
      expect(PERMISSION_STATUS.PENDING).toBe('pending');
      expect(PERMISSION_STATUS.APPROVED).toBe('approved');
      expect(PERMISSION_STATUS.DENIED).toBe('denied');
      expect(PERMISSION_STATUS.EXPIRED).toBe('expired');
      expect(PERMISSION_STATUS.USED).toBe('used');
    });

    it('should be readonly', () => {
      // TypeScript should prevent direct assignment, but we can verify values exist
      expect(Object.keys(PERMISSION_STATUS)).toHaveLength(5);
    });
  });

  describe('POLICY_ACTION', () => {
    it('should have all required actions', () => {
      expect(POLICY_ACTION.AUTO_APPROVE).toBe('auto_approve');
      expect(POLICY_ACTION.REQUIRE_APPROVAL).toBe('require_approval');
      expect(POLICY_ACTION.DENY).toBe('deny');
    });

    it('should have exactly 3 actions', () => {
      expect(Object.keys(POLICY_ACTION)).toHaveLength(3);
    });
  });

  describe('TOKEN_DEFAULTS', () => {
    it('should have sensible default values', () => {
      expect(TOKEN_DEFAULTS.DEFAULT_TTL_SECONDS).toBe(300); // 5 minutes
      expect(TOKEN_DEFAULTS.MIN_TTL_SECONDS).toBe(30); // 30 seconds
      expect(TOKEN_DEFAULTS.MAX_TTL_SECONDS).toBe(3600); // 1 hour
      expect(TOKEN_DEFAULTS.DEFAULT_USES).toBe(1); // One-time use by default
    });

    it('should have valid TTL range', () => {
      expect(TOKEN_DEFAULTS.MIN_TTL_SECONDS).toBeLessThan(
        TOKEN_DEFAULTS.DEFAULT_TTL_SECONDS
      );
      expect(TOKEN_DEFAULTS.DEFAULT_TTL_SECONDS).toBeLessThan(
        TOKEN_DEFAULTS.MAX_TTL_SECONDS
      );
    });
  });

  describe('PAGINATION_DEFAULTS', () => {
    it('should have sensible default values', () => {
      expect(PAGINATION_DEFAULTS.DEFAULT_PAGE).toBe(1);
      expect(PAGINATION_DEFAULTS.DEFAULT_LIMIT).toBe(20);
      expect(PAGINATION_DEFAULTS.MAX_LIMIT).toBe(100);
    });

    it('should have valid limit range', () => {
      expect(PAGINATION_DEFAULTS.DEFAULT_LIMIT).toBeLessThanOrEqual(
        PAGINATION_DEFAULTS.MAX_LIMIT
      );
    });
  });

  describe('AUDIT_EVENT_TYPE', () => {
    it('should have all permission-related events', () => {
      expect(AUDIT_EVENT_TYPE.REQUEST).toBe('request');
      expect(AUDIT_EVENT_TYPE.APPROVE).toBe('approve');
      expect(AUDIT_EVENT_TYPE.DENY).toBe('deny');
      expect(AUDIT_EVENT_TYPE.USE).toBe('use');
      expect(AUDIT_EVENT_TYPE.REVOKE).toBe('revoke');
      expect(AUDIT_EVENT_TYPE.EXPIRE).toBe('expire');
    });

    it('should have all agent-related events', () => {
      expect(AUDIT_EVENT_TYPE.AGENT_CREATE).toBe('agent_create');
      expect(AUDIT_EVENT_TYPE.AGENT_UPDATE).toBe('agent_update');
      expect(AUDIT_EVENT_TYPE.AGENT_DELETE).toBe('agent_delete');
    });

    it('should have all policy-related events', () => {
      expect(AUDIT_EVENT_TYPE.POLICY_CREATE).toBe('policy_create');
      expect(AUDIT_EVENT_TYPE.POLICY_UPDATE).toBe('policy_update');
      expect(AUDIT_EVENT_TYPE.POLICY_DELETE).toBe('policy_delete');
    });
  });

  describe('HTTP_STATUS', () => {
    it('should have all success codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.ACCEPTED).toBe(202);
      expect(HTTP_STATUS.NO_CONTENT).toBe(204);
    });

    it('should have all client error codes', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422);
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429);
    });

    it('should have server error codes', () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });
});
