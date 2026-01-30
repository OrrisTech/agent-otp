/**
 * SMS service for capturing and processing SMS messages
 *
 * NOTE: This requires native module implementation for actual SMS reading.
 * On Android, we need to use the SMS BroadcastReceiver.
 * This file provides the interface and OTP extraction logic.
 */

import type { SMSMessage, ExtractedOTP, OTPRequest } from '@/types';

/**
 * OTP patterns for extraction from SMS
 */
const OTP_PATTERNS = [
  // "Your code is 123456" or "verification code: 123456" or "Your OTP is 1234"
  /(?:code|otp|pin|verification|passcode|password|确认码|验证码)\s*(?:is|:)\s*([0-9]{4,8})/i,

  // "123-456" format with code prefix
  /(?:code|otp|pin|verification)\s*(?:is|:)\s*([0-9]{3}-[0-9]{3})/i,

  // "Enter 123456 to verify"
  /enter\s+([0-9]{4,8})\s+to\s+verify/i,

  // "123456 is your verification code"
  /([0-9]{4,8})\s+is\s+your\s+(?:verification\s+)?(?:code|otp)/i,

  // Chinese OTP patterns
  /验证码[：:]\s*([0-9]{4,8})/,
  /您的验证码是\s*([0-9]{4,8})/,

  // Standalone 6-digit code in short message (fallback)
  /^[^\d]*([0-9]{6})[^\d]*$/,
];

/**
 * Extract OTP from SMS message
 */
export function extractOTPFromSMS(sms: SMSMessage): ExtractedOTP | null {
  const content = sms.body;

  for (const pattern of OTP_PATTERNS) {
    const match = content.match(pattern);
    if (match?.[1]) {
      // Clean the code (remove dashes, spaces)
      const code = match[1].replace(/[-\s]/g, '');

      // Calculate confidence
      const confidence = calculateConfidence(content, code);

      return {
        code,
        confidence,
        smsId: sms.id,
        sender: sms.sender,
      };
    }
  }

  return null;
}

/**
 * Calculate confidence score for extracted OTP
 */
function calculateConfidence(content: string, code: string): number {
  let confidence = 0.5; // Base confidence

  const lowerContent = content.toLowerCase();

  // Higher confidence for explicit OTP keywords
  const otpKeywords = [
    'verification',
    'verify',
    'otp',
    'one-time',
    'passcode',
    '验证码',
    '确认码',
  ];

  for (const keyword of otpKeywords) {
    if (lowerContent.includes(keyword)) {
      confidence += 0.1;
    }
  }

  // Higher confidence for 6-digit codes (most common OTP length)
  if (code.length === 6 && /^\d+$/.test(code)) {
    confidence += 0.1;
  }

  // Higher confidence if "do not share" warning present
  if (
    lowerContent.includes('do not share') ||
    lowerContent.includes('not share this') ||
    lowerContent.includes('请勿分享') ||
    lowerContent.includes('请勿泄露')
  ) {
    confidence += 0.15;
  }

  // Higher confidence for short messages (likely automated)
  if (content.length < 200) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1.0);
}

/**
 * Check if sender matches expected pattern
 */
export function matchesSenderPattern(sender: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(sender);
}

/**
 * Match SMS against pending OTP requests
 */
export function matchSMSToRequest(
  sms: SMSMessage,
  requests: OTPRequest[]
): { request: OTPRequest; otp: ExtractedOTP } | null {
  const extracted = extractOTPFromSMS(sms);
  if (!extracted) {
    return null;
  }

  for (const request of requests) {
    // Check if request is looking for SMS
    const sources = request.filter?.sources ?? ['sms'];
    if (!sources.includes('sms')) {
      continue;
    }

    // Check sender pattern
    if (
      request.filter?.senderPattern &&
      !matchesSenderPattern(sms.sender, request.filter.senderPattern)
    ) {
      continue;
    }

    // Check expected sender mention
    if (request.expectedSender) {
      const content = `${sms.sender}\n${sms.body}`;
      if (!content.toLowerCase().includes(request.expectedSender.toLowerCase())) {
        continue;
      }
    }

    // Found a match!
    return {
      request,
      otp: {
        ...extracted,
        matchedRequestId: request.id,
      },
    };
  }

  return null;
}

/**
 * SMS listener callback type
 */
export type SMSCallback = (sms: SMSMessage) => void;

/**
 * SMS listener interface
 * Actual implementation needs native module
 */
export interface SMSListener {
  start(callback: SMSCallback): void;
  stop(): void;
  isListening(): boolean;
}

/**
 * Mock SMS listener for development
 */
export class MockSMSListener implements SMSListener {
  private callback: SMSCallback | null = null;
  private listening = false;

  start(callback: SMSCallback): void {
    this.callback = callback;
    this.listening = true;
    console.log('[MockSMSListener] Started listening for SMS');
  }

  stop(): void {
    this.callback = null;
    this.listening = false;
    console.log('[MockSMSListener] Stopped listening');
  }

  isListening(): boolean {
    return this.listening;
  }

  // For testing: simulate receiving an SMS
  simulateReceive(sender: string, body: string): void {
    if (this.callback && this.listening) {
      const sms: SMSMessage = {
        id: `sms_${Date.now()}`,
        sender,
        body,
        receivedAt: new Date(),
        isRead: false,
      };
      this.callback(sms);
    }
  }
}
