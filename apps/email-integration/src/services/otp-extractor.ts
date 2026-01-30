/**
 * OTP Extractor - Extracts verification codes from email content
 *
 * Supports common OTP patterns:
 * - 4-8 digit numeric codes
 * - Alphanumeric codes (e.g., A1B2C3)
 * - Codes with dashes (e.g., 123-456)
 */

/**
 * Common OTP patterns found in verification emails
 */
const OTP_PATTERNS = [
  // "Your code is 123456" or "verification code: 123456" or "Your OTP is 1234"
  /(?:code|otp|pin|verification|passcode|password|确认码|验证码)\s*(?:is|:)\s*([0-9]{4,8})/i,

  // "Your code is: ABC123" (alphanumeric)
  /(?:code|otp|pin|verification)\s*(?:is|:)\s*([A-Z0-9]{4,8})/i,

  // "123-456" format with code prefix
  /(?:code|otp|pin|verification)\s*(?:is|:)\s*([0-9]{3}-[0-9]{3})/i,

  // "Enter 123456 to verify"
  /enter\s+([0-9]{4,8})\s+to\s+verify/i,

  // "123456 is your verification code" or "123456 is your OTP"
  /([0-9]{4,8})\s+is\s+your\s+(?:verification\s+)?(?:code|otp)/i,

  // Chinese OTP patterns
  /验证码[：:]\s*([0-9]{4,8})/,
  /您的验证码是\s*([0-9]{4,8})/,

  // Standalone 6-digit code in a short message (fallback)
  /^[^\d]*([0-9]{6})[^\d]*$/,
];

/**
 * Extracted OTP result
 */
export interface ExtractedOTP {
  code: string;
  confidence: number; // 0-1 confidence score
  pattern: string; // Which pattern matched
}

/**
 * Extract OTP from email content
 */
export function extractOTP(
  subject: string,
  body: string
): ExtractedOTP | null {
  // Combine subject and body for searching
  const content = `${subject}\n${body}`;

  // Try each pattern
  for (const pattern of OTP_PATTERNS) {
    const match = content.match(pattern);
    if (match && match[1]) {
      // Clean the code (remove dashes, spaces)
      const code = match[1].replace(/[-\s]/g, '');

      // Calculate confidence based on context
      const confidence = calculateConfidence(content, code, pattern.source);

      return {
        code,
        confidence,
        pattern: pattern.source,
      };
    }
  }

  return null;
}

/**
 * Calculate confidence score for extracted OTP
 */
function calculateConfidence(
  content: string,
  code: string,
  pattern: string
): number {
  let confidence = 0.5; // Base confidence

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

  const lowerContent = content.toLowerCase();
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

  // Higher confidence for short emails (likely automated)
  if (content.length < 500) {
    confidence += 0.1;
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Check if sender matches expected pattern
 */
export function matchesSenderPattern(
  sender: string,
  pattern: string
): boolean {
  // Convert glob pattern to regex
  // * matches any characters, ? matches single character
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special chars
    .replace(/\*/g, '.*') // * -> .*
    .replace(/\?/g, '.'); // ? -> .

  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(sender);
}

/**
 * Check if email subject/body mentions expected sender
 */
export function mentionsExpectedSender(
  content: string,
  expectedSender: string
): boolean {
  const lowerContent = content.toLowerCase();
  const lowerSender = expectedSender.toLowerCase();

  // Direct mention
  if (lowerContent.includes(lowerSender)) {
    return true;
  }

  // Check for partial matches (e.g., "Acme" in "Acme Inc")
  const words = lowerSender.split(/\s+/);
  for (const word of words) {
    if (word.length >= 3 && lowerContent.includes(word)) {
      return true;
    }
  }

  return false;
}
