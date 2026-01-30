/**
 * Tests for shared constants.
 *
 * Agent OTP Relay - Secure OTP relay for AI agents.
 */

import { describe, it, expect } from 'vitest';
import {
  OTP_REQUEST_STATUS,
  OTP_SOURCE,
  OTP_DEFAULTS,
  PAGINATION_DEFAULTS,
  AUDIT_EVENT_TYPE,
  HTTP_STATUS,
  DEVICE_TYPE,
  EMAIL_INTEGRATION_TYPE,
  RATE_LIMIT_DEFAULTS,
} from '../src/constants';

describe('Constants', () => {
  describe('OTP_REQUEST_STATUS', () => {
    it('should have all required statuses', () => {
      expect(OTP_REQUEST_STATUS.PENDING_APPROVAL).toBe('pending_approval');
      expect(OTP_REQUEST_STATUS.APPROVED).toBe('approved');
      expect(OTP_REQUEST_STATUS.OTP_RECEIVED).toBe('otp_received');
      expect(OTP_REQUEST_STATUS.CONSUMED).toBe('consumed');
      expect(OTP_REQUEST_STATUS.DENIED).toBe('denied');
      expect(OTP_REQUEST_STATUS.EXPIRED).toBe('expired');
      expect(OTP_REQUEST_STATUS.CANCELLED).toBe('cancelled');
    });

    it('should have exactly 7 statuses', () => {
      expect(Object.keys(OTP_REQUEST_STATUS)).toHaveLength(7);
    });
  });

  describe('OTP_SOURCE', () => {
    it('should have all required sources', () => {
      expect(OTP_SOURCE.SMS).toBe('sms');
      expect(OTP_SOURCE.EMAIL).toBe('email');
      expect(OTP_SOURCE.WHATSAPP).toBe('whatsapp');
    });

    it('should have exactly 3 sources', () => {
      expect(Object.keys(OTP_SOURCE)).toHaveLength(3);
    });
  });

  describe('OTP_DEFAULTS', () => {
    it('should have sensible default values', () => {
      expect(OTP_DEFAULTS.DEFAULT_TTL_SECONDS).toBe(300); // 5 minutes
      expect(OTP_DEFAULTS.MIN_TTL_SECONDS).toBe(60); // 1 minute
      expect(OTP_DEFAULTS.MAX_TTL_SECONDS).toBe(600); // 10 minutes
      expect(OTP_DEFAULTS.APPROVAL_TIMEOUT_SECONDS).toBe(120); // 2 minutes
    });

    it('should have valid TTL range', () => {
      expect(OTP_DEFAULTS.MIN_TTL_SECONDS).toBeLessThan(
        OTP_DEFAULTS.DEFAULT_TTL_SECONDS
      );
      expect(OTP_DEFAULTS.DEFAULT_TTL_SECONDS).toBeLessThan(
        OTP_DEFAULTS.MAX_TTL_SECONDS
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
    it('should have all OTP-related events', () => {
      expect(AUDIT_EVENT_TYPE.OTP_REQUEST).toBe('otp_request');
      expect(AUDIT_EVENT_TYPE.OTP_APPROVE).toBe('otp_approve');
      expect(AUDIT_EVENT_TYPE.OTP_DENY).toBe('otp_deny');
      expect(AUDIT_EVENT_TYPE.OTP_RECEIVE).toBe('otp_receive');
      expect(AUDIT_EVENT_TYPE.OTP_CONSUME).toBe('otp_consume');
      expect(AUDIT_EVENT_TYPE.OTP_EXPIRE).toBe('otp_expire');
      expect(AUDIT_EVENT_TYPE.OTP_CANCEL).toBe('otp_cancel');
    });

    it('should have all agent-related events', () => {
      expect(AUDIT_EVENT_TYPE.AGENT_CREATE).toBe('agent_create');
      expect(AUDIT_EVENT_TYPE.AGENT_UPDATE).toBe('agent_update');
      expect(AUDIT_EVENT_TYPE.AGENT_DELETE).toBe('agent_delete');
    });

    it('should have all device and email events', () => {
      expect(AUDIT_EVENT_TYPE.DEVICE_REGISTER).toBe('device_register');
      expect(AUDIT_EVENT_TYPE.DEVICE_REMOVE).toBe('device_remove');
      expect(AUDIT_EVENT_TYPE.EMAIL_CONNECT).toBe('email_connect');
      expect(AUDIT_EVENT_TYPE.EMAIL_DISCONNECT).toBe('email_disconnect');
    });
  });

  describe('DEVICE_TYPE', () => {
    it('should have all device types', () => {
      expect(DEVICE_TYPE.ANDROID).toBe('android');
      expect(DEVICE_TYPE.IOS).toBe('ios');
    });
  });

  describe('EMAIL_INTEGRATION_TYPE', () => {
    it('should have all integration types', () => {
      expect(EMAIL_INTEGRATION_TYPE.GMAIL_API).toBe('gmail_api');
      expect(EMAIL_INTEGRATION_TYPE.IMAP).toBe('imap');
      expect(EMAIL_INTEGRATION_TYPE.OUTLOOK).toBe('outlook');
    });
  });

  describe('RATE_LIMIT_DEFAULTS', () => {
    it('should have sensible rate limits', () => {
      expect(RATE_LIMIT_DEFAULTS.OTP_REQUESTS_PER_MINUTE).toBe(10);
      expect(RATE_LIMIT_DEFAULTS.OTP_APPROVALS_PER_MINUTE).toBe(30);
      expect(RATE_LIMIT_DEFAULTS.OTP_CAPTURES_PER_DAY).toBe(100);
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
