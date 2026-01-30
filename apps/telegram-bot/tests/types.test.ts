import { describe, it, expect } from 'vitest';
import { encodeCallbackData, decodeCallbackData } from '../src/types.js';

describe('Callback Data Encoding', () => {
  describe('encodeCallbackData', () => {
    it('should encode approve action', () => {
      const result = encodeCallbackData({
        action: 'approve',
        requestId: 'otp_abc123',
      });
      expect(result).toBe('approve:otp_abc123');
    });

    it('should encode deny action', () => {
      const result = encodeCallbackData({
        action: 'deny',
        requestId: 'otp_xyz789',
      });
      expect(result).toBe('deny:otp_xyz789');
    });
  });

  describe('decodeCallbackData', () => {
    it('should decode approve action', () => {
      const result = decodeCallbackData('approve:otp_abc123');
      expect(result).toEqual({
        action: 'approve',
        requestId: 'otp_abc123',
      });
    });

    it('should decode deny action', () => {
      const result = decodeCallbackData('deny:otp_xyz789');
      expect(result).toEqual({
        action: 'deny',
        requestId: 'otp_xyz789',
      });
    });

    it('should return null for invalid format', () => {
      expect(decodeCallbackData('invalid')).toBeNull();
      expect(decodeCallbackData('')).toBeNull();
      expect(decodeCallbackData('too:many:parts')).toBeNull();
    });

    it('should return null for invalid action', () => {
      expect(decodeCallbackData('unknown:otp_abc123')).toBeNull();
      expect(decodeCallbackData('cancel:otp_abc123')).toBeNull();
    });

    it('should handle request IDs with special characters', () => {
      const result = decodeCallbackData('approve:otp_abc-123_xyz');
      expect(result).toEqual({
        action: 'approve',
        requestId: 'otp_abc-123_xyz',
      });
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should correctly round-trip approve action', () => {
      const original = { action: 'approve' as const, requestId: 'otp_test123' };
      const encoded = encodeCallbackData(original);
      const decoded = decodeCallbackData(encoded);
      expect(decoded).toEqual(original);
    });

    it('should correctly round-trip deny action', () => {
      const original = { action: 'deny' as const, requestId: 'otp_test456' };
      const encoded = encodeCallbackData(original);
      const decoded = decodeCallbackData(encoded);
      expect(decoded).toEqual(original);
    });
  });
});
