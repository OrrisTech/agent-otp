import { describe, it, expect } from 'vitest';
import {
  extractOTP,
  matchesSenderPattern,
  mentionsExpectedSender,
} from '../src/services/otp-extractor.js';

describe('OTP Extractor', () => {
  describe('extractOTP', () => {
    it('should extract OTP from "Your code is 123456"', () => {
      const result = extractOTP('', 'Your code is 123456');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('123456');
    });

    it('should extract OTP from "verification code: 789012"', () => {
      const result = extractOTP('Verification Code', 'Your verification code: 789012');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('789012');
    });

    it('should extract OTP from "Enter 456789 to verify"', () => {
      const result = extractOTP('', 'Please enter 456789 to verify your account');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('456789');
    });

    it('should extract OTP from "123456 is your verification code"', () => {
      const result = extractOTP('', '123456 is your verification code');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('123456');
    });

    it('should extract OTP from Chinese message "验证码：654321"', () => {
      const result = extractOTP('', '您的验证码：654321，请勿泄露');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('654321');
    });

    it('should extract OTP from "您的验证码是 123456"', () => {
      const result = extractOTP('', '您的验证码是 123456');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('123456');
    });

    it('should extract 4-digit OTP', () => {
      const result = extractOTP('', 'Your OTP is 1234');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('1234');
    });

    it('should extract 8-digit OTP', () => {
      const result = extractOTP('', 'Your verification code is 12345678');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('12345678');
    });

    it('should extract OTP with dashes', () => {
      const result = extractOTP('', 'Your verification code: 123-456');
      expect(result).not.toBeNull();
      expect(result?.code).toBe('123456');
    });

    it('should return null for no OTP', () => {
      const result = extractOTP('Welcome', 'Thank you for signing up!');
      expect(result).toBeNull();
    });

    it('should have higher confidence with security warning', () => {
      const withWarning = extractOTP(
        '',
        'Your code is 123456. Do not share this with anyone.'
      );
      const withoutWarning = extractOTP('', 'Your code is 654321');

      expect(withWarning).not.toBeNull();
      expect(withoutWarning).not.toBeNull();
      expect(withWarning!.confidence).toBeGreaterThan(withoutWarning!.confidence);
    });
  });

  describe('matchesSenderPattern', () => {
    it('should match exact email', () => {
      expect(matchesSenderPattern('noreply@acme.com', 'noreply@acme.com')).toBe(true);
    });

    it('should match wildcard prefix', () => {
      expect(matchesSenderPattern('noreply@acme.com', '*@acme.com')).toBe(true);
      expect(matchesSenderPattern('support@acme.com', '*@acme.com')).toBe(true);
    });

    it('should match wildcard suffix', () => {
      expect(matchesSenderPattern('noreply@mail.acme.com', 'noreply@*.acme.com')).toBe(true);
    });

    it('should not match different domain', () => {
      expect(matchesSenderPattern('noreply@other.com', '*@acme.com')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(matchesSenderPattern('NoReply@ACME.com', '*@acme.com')).toBe(true);
    });
  });

  describe('mentionsExpectedSender', () => {
    it('should find direct mention', () => {
      expect(mentionsExpectedSender('Welcome to Acme Inc', 'Acme')).toBe(true);
    });

    it('should find mention in body', () => {
      expect(
        mentionsExpectedSender('Your verification code from Acme is 123456', 'Acme')
      ).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(mentionsExpectedSender('Welcome to ACME', 'acme')).toBe(true);
    });

    it('should find partial match', () => {
      expect(mentionsExpectedSender('Welcome to our service', 'Acme Inc')).toBe(false);
      expect(mentionsExpectedSender('Welcome to Acme service', 'Acme Inc')).toBe(true);
    });

    it('should return false if not mentioned', () => {
      expect(mentionsExpectedSender('Your code is 123456', 'Acme')).toBe(false);
    });
  });
});
