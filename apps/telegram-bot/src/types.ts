import type { Context, SessionFlavor } from 'grammy';

/**
 * User session data stored in memory
 */
export interface SessionData {
  // Telegram chat ID linked to Agent OTP user ID
  agentOtpUserId?: string;
  // API key for this user (optional, for self-service linking)
  linkedApiKey?: string;
  // Pending OTP requests awaiting user action
  pendingRequests: Map<string, PendingOTPRequest>;
}

/**
 * Pending OTP request that needs user approval
 */
export interface PendingOTPRequest {
  requestId: string;
  agentId: string;
  agentName: string;
  reason: string;
  expectedSender?: string;
  sources?: string[];
  senderPattern?: string;
  createdAt: Date;
  expiresAt: Date;
  messageId?: number; // Telegram message ID for updating
}

/**
 * Webhook payload from Agent OTP API for new OTP requests
 */
export interface OTPRequestWebhookPayload {
  event: 'otp_request.created' | 'otp_request.expired' | 'otp_request.cancelled';
  data: {
    requestId: string;
    agentId: string;
    agentName: string;
    reason: string;
    expectedSender?: string;
    filter?: {
      sources?: string[];
      senderPattern?: string;
    };
    createdAt: string;
    expiresAt: string;
  };
  // Telegram user ID to notify
  telegramUserId: number;
}

/**
 * Response from Agent OTP API when approving/denying a request
 */
export interface ApprovalResponse {
  success: boolean;
  message: string;
  requestId: string;
  status: 'approved' | 'denied';
}

/**
 * Custom context type with session
 */
export type BotContext = Context & SessionFlavor<SessionData>;

/**
 * Callback query data structure for inline buttons
 */
export interface CallbackData {
  action: 'approve' | 'deny';
  requestId: string;
}

/**
 * Encode callback data for inline button
 */
export function encodeCallbackData(data: CallbackData): string {
  return `${data.action}:${data.requestId}`;
}

/**
 * Decode callback data from inline button
 */
export function decodeCallbackData(data: string): CallbackData | null {
  const parts = data.split(':');
  if (parts.length !== 2) return null;

  const [action, requestId] = parts;
  if (action !== 'approve' && action !== 'deny') return null;

  return { action, requestId };
}
