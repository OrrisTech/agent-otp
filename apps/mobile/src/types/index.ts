/**
 * Type definitions for Agent OTP Mobile App
 */

/**
 * OTP Request received from API
 */
export interface OTPRequest {
  id: string;
  agentId: string;
  agentName: string;
  reason: string;
  expectedSender?: string;
  filter?: {
    sources?: string[];
    senderPattern?: string;
  };
  publicKey: string;
  status: OTPRequestStatus;
  createdAt: string;
  expiresAt: string;
}

export type OTPRequestStatus =
  | 'pending_approval'
  | 'approved'
  | 'otp_received'
  | 'consumed'
  | 'denied'
  | 'expired'
  | 'cancelled';

/**
 * SMS message received on device
 */
export interface SMSMessage {
  id: string;
  sender: string;
  body: string;
  receivedAt: Date;
  isRead: boolean;
}

/**
 * Extracted OTP from SMS
 */
export interface ExtractedOTP {
  code: string;
  confidence: number;
  smsId: string;
  sender: string;
  matchedRequestId?: string;
}

/**
 * App configuration stored securely
 */
export interface AppConfig {
  apiUrl: string;
  apiKey: string;
  deviceId: string;
  isLinked: boolean;
  userId?: string;
  linkedAt?: Date;
  autoApprove?: boolean;
}

/**
 * Connection status
 */
export interface ConnectionStatus {
  isConnected: boolean;
  lastSync: Date | null;
  pendingRequests: number;
}
