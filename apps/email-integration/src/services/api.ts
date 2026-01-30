/**
 * Agent OTP API Client for the Email Integration service
 */

import { config } from '../config.js';

/**
 * OTP submission payload
 */
export interface OTPSubmission {
  requestId: string;
  encryptedPayload: string; // OTP encrypted with agent's public key
  source: 'email';
  metadata: {
    emailId: string;
    from: string;
    subject: string;
    receivedAt: string;
    confidence: number;
  };
}

/**
 * Agent OTP API Client
 */
export class AgentOTPApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.AGENT_OTP_API_URL;
    this.apiKey = config.AGENT_OTP_API_KEY;
  }

  /**
   * Make an authenticated request
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Submit an encrypted OTP for a request
   */
  async submitOTP(submission: OTPSubmission): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request('POST', `/v1/otp/${submission.requestId}/receive`, {
      encryptedPayload: submission.encryptedPayload,
      source: submission.source,
      metadata: submission.metadata,
    });
  }

  /**
   * Get pending OTP requests that need email monitoring
   */
  async getPendingEmailRequests(): Promise<{
    requests: Array<{
      requestId: string;
      publicKey: string;
      expectedSender?: string;
      senderPattern?: string;
      sources: string[];
      createdAt: string;
      expiresAt: string;
    }>;
  }> {
    return this.request('GET', '/v1/otp/pending?source=email');
  }

  /**
   * Get a specific request's public key for encryption
   */
  async getRequestPublicKey(requestId: string): Promise<{
    publicKey: string;
  }> {
    return this.request('GET', `/v1/otp/${requestId}/public-key`);
  }
}

export const apiClient = new AgentOTPApiClient();
