/**
 * Tests for Zod validation schemas.
 *
 * Agent OTP Relay - Secure OTP relay for AI agents.
 */

import { describe, it, expect } from 'vitest';
import {
  uuidSchema,
  paginationSchema,
  createUserSchema,
  createAgentSchema,
  updateAgentSchema,
  otpSourceSchema,
  otpSourceFilterSchema,
  otpRequestStatusSchema,
  createOTPRequestSchema,
  deviceTypeSchema,
  registerDeviceSchema,
  auditEventTypeSchema,
  auditLogFilterSchema,
  otpApprovalDecisionSchema,
} from '../src/schemas';

describe('Schemas', () => {
  describe('uuidSchema', () => {
    it('should accept valid UUIDs', () => {
      const result = uuidSchema.safeParse('123e4567-e89b-12d3-a456-426614174000');
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const result = uuidSchema.safeParse('not-a-uuid');
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should apply defaults', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should accept valid values', () => {
      const result = paginationSchema.parse({ page: 2, limit: 50 });
      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should reject limit above max', () => {
      const result = paginationSchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('should accept valid user input', () => {
      const result = createUserSchema.safeParse({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = createUserSchema.safeParse({
        email: 'not-an-email',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createAgentSchema', () => {
    it('should accept valid agent input', () => {
      const result = createAgentSchema.parse({
        name: 'My Agent',
        description: 'A test agent',
      });
      expect(result.name).toBe('My Agent');
      expect(result.metadata).toEqual({});
    });

    it('should reject missing name', () => {
      const result = createAgentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('updateAgentSchema', () => {
    it('should accept partial updates', () => {
      const result = updateAgentSchema.safeParse({
        isActive: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });
  });

  describe('otpSourceSchema', () => {
    it('should accept valid sources', () => {
      expect(otpSourceSchema.safeParse('sms').success).toBe(true);
      expect(otpSourceSchema.safeParse('email').success).toBe(true);
      expect(otpSourceSchema.safeParse('whatsapp').success).toBe(true);
    });

    it('should reject invalid sources', () => {
      expect(otpSourceSchema.safeParse('telegram').success).toBe(false);
    });
  });

  describe('otpSourceFilterSchema', () => {
    it('should accept valid filter', () => {
      const result = otpSourceFilterSchema.safeParse({
        sources: ['sms', 'email'],
        senderPattern: '*@google.com',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty filter', () => {
      const result = otpSourceFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('otpRequestStatusSchema', () => {
    it('should accept all valid statuses', () => {
      const statuses = [
        'pending_approval',
        'approved',
        'otp_received',
        'consumed',
        'denied',
        'expired',
        'cancelled',
      ];
      statuses.forEach((status) => {
        expect(otpRequestStatusSchema.safeParse(status).success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      expect(otpRequestStatusSchema.safeParse('pending').success).toBe(false);
    });
  });

  describe('createOTPRequestSchema', () => {
    it('should accept valid OTP request', () => {
      const result = createOTPRequestSchema.parse({
        reason: 'Sign up for Acme service',
        expectedSender: 'Acme',
        publicKey: 'base64encodedkey==',
      });
      expect(result.reason).toBe('Sign up for Acme service');
      expect(result.ttl).toBe(300); // Default
    });

    it('should reject missing reason', () => {
      const result = createOTPRequestSchema.safeParse({
        publicKey: 'key',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing publicKey', () => {
      const result = createOTPRequestSchema.safeParse({
        reason: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should enforce TTL limits', () => {
      const tooShort = createOTPRequestSchema.safeParse({
        reason: 'Test',
        publicKey: 'key',
        ttl: 30, // Below minimum
      });
      expect(tooShort.success).toBe(false);

      const tooLong = createOTPRequestSchema.safeParse({
        reason: 'Test',
        publicKey: 'key',
        ttl: 1000, // Above maximum
      });
      expect(tooLong.success).toBe(false);
    });
  });

  describe('deviceTypeSchema', () => {
    it('should accept valid device types', () => {
      expect(deviceTypeSchema.safeParse('android').success).toBe(true);
      expect(deviceTypeSchema.safeParse('ios').success).toBe(true);
    });

    it('should reject invalid device types', () => {
      expect(deviceTypeSchema.safeParse('windows').success).toBe(false);
    });
  });

  describe('registerDeviceSchema', () => {
    it('should accept valid device registration', () => {
      const result = registerDeviceSchema.safeParse({
        deviceType: 'android',
        deviceName: 'My Phone',
        pushToken: 'fcm-token-123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing deviceType', () => {
      const result = registerDeviceSchema.safeParse({
        deviceName: 'My Phone',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('auditEventTypeSchema', () => {
    it('should accept all OTP event types', () => {
      const events = [
        'otp_request',
        'otp_approve',
        'otp_deny',
        'otp_receive',
        'otp_consume',
        'otp_expire',
        'otp_cancel',
      ];
      events.forEach((event) => {
        expect(auditEventTypeSchema.safeParse(event).success).toBe(true);
      });
    });
  });

  describe('auditLogFilterSchema', () => {
    it('should accept valid filter', () => {
      const result = auditLogFilterSchema.safeParse({
        agentId: '123e4567-e89b-12d3-a456-426614174000',
        eventType: 'otp_request',
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty filter', () => {
      const result = auditLogFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('otpApprovalDecisionSchema', () => {
    it('should accept approval', () => {
      const result = otpApprovalDecisionSchema.safeParse({
        approved: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept denial with reason', () => {
      const result = otpApprovalDecisionSchema.safeParse({
        approved: false,
        reason: 'Not authorized',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing approved field', () => {
      const result = otpApprovalDecisionSchema.safeParse({
        reason: 'Test',
      });
      expect(result.success).toBe(false);
    });
  });
});
