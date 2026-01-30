/**
 * SMS service tests
 */

import {
  extractOTPFromSMS,
  matchesSenderPattern,
} from '../src/services/sms';
import type { SMSMessage } from '../src/types';

describe('extractOTPFromSMS', () => {
  const createSMS = (body: string, sender = 'TEST'): SMSMessage => ({
    id: 'test_sms',
    sender,
    body,
    receivedAt: new Date(),
    isRead: false,
  });

  it('extracts OTP from "Your code is 123456" format', () => {
    const sms = createSMS('Your code is 123456');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('123456');
  });

  it('extracts OTP from "verification code: 123456" format', () => {
    const sms = createSMS('Your verification code: 123456');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('123456');
  });

  it('extracts OTP from "OTP is 1234" format', () => {
    const sms = createSMS('Your OTP is 1234');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('1234');
  });

  it('extracts OTP from "Enter 123456 to verify" format', () => {
    const sms = createSMS('Enter 123456 to verify your account');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('123456');
  });

  it('extracts OTP from "123456 is your verification code" format', () => {
    const sms = createSMS('123456 is your verification code');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('123456');
  });

  it('extracts OTP from Chinese format', () => {
    const sms = createSMS('您的验证码是 654321，请勿分享');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('654321');
  });

  it('extracts OTP from short 6-digit message', () => {
    const sms = createSMS('123456');
    const result = extractOTPFromSMS(sms);
    expect(result).not.toBeNull();
    expect(result?.code).toBe('123456');
  });

  it('returns null for messages without OTP', () => {
    const sms = createSMS('Hello, this is a regular message');
    const result = extractOTPFromSMS(sms);
    expect(result).toBeNull();
  });

  it('includes sender in extracted OTP', () => {
    const sms = createSMS('Your code is 123456', 'ACME');
    const result = extractOTPFromSMS(sms);
    expect(result?.sender).toBe('ACME');
  });

  it('calculates higher confidence for messages with "do not share"', () => {
    const smsWithWarning = createSMS('Your code is 123456. Do not share this with anyone.');
    const smsWithoutWarning = createSMS('Your code is 123456');

    const resultWithWarning = extractOTPFromSMS(smsWithWarning);
    const resultWithoutWarning = extractOTPFromSMS(smsWithoutWarning);

    expect(resultWithWarning?.confidence).toBeGreaterThan(resultWithoutWarning?.confidence ?? 0);
  });
});

describe('matchesSenderPattern', () => {
  it('matches exact sender', () => {
    expect(matchesSenderPattern('ACME', 'ACME')).toBe(true);
    expect(matchesSenderPattern('ACME', 'ZOOM')).toBe(false);
  });

  it('matches case-insensitively', () => {
    expect(matchesSenderPattern('ACME', 'acme')).toBe(true);
    expect(matchesSenderPattern('acme', 'ACME')).toBe(true);
  });

  it('matches wildcard patterns', () => {
    expect(matchesSenderPattern('ACME-123', 'ACME-*')).toBe(true);
    expect(matchesSenderPattern('ACME-456', 'ACME-*')).toBe(true);
    expect(matchesSenderPattern('ZOOM-123', 'ACME-*')).toBe(false);
  });

  it('matches single character wildcard', () => {
    expect(matchesSenderPattern('ACME1', 'ACME?')).toBe(true);
    expect(matchesSenderPattern('ACME12', 'ACME?')).toBe(false);
  });

  it('matches phone number patterns', () => {
    expect(matchesSenderPattern('+1234567890', '+*')).toBe(true);
    expect(matchesSenderPattern('12345', '12345')).toBe(true);
  });
});
