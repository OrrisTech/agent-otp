import { config } from '../config.js';
import type { ApprovalResponse } from '../types.js';

/**
 * Agent OTP API client for the Telegram bot
 */
export class AgentOTPApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.AGENT_OTP_API_URL;
    this.apiKey = config.AGENT_OTP_API_KEY;
  }

  /**
   * Make an authenticated request to the Agent OTP API
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
   * Approve an OTP request
   */
  async approveRequest(requestId: string): Promise<ApprovalResponse> {
    return this.request<ApprovalResponse>(
      'POST',
      `/v1/otp/${requestId}/approve`,
      {}
    );
  }

  /**
   * Deny an OTP request
   */
  async denyRequest(requestId: string): Promise<ApprovalResponse> {
    return this.request<ApprovalResponse>(
      'POST',
      `/v1/otp/${requestId}/deny`,
      {}
    );
  }

  /**
   * Get OTP request status
   */
  async getRequestStatus(requestId: string): Promise<{
    id: string;
    status: string;
    reason: string;
    agentId: string;
    agentName: string;
    createdAt: string;
    expiresAt: string;
  }> {
    return this.request('GET', `/v1/otp/${requestId}`);
  }

  /**
   * Link a Telegram user ID to an Agent OTP user account
   */
  async linkTelegramUser(
    telegramUserId: number,
    linkToken: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('POST', '/v1/users/link-telegram', {
      telegramUserId,
      linkToken,
    });
  }

  /**
   * Check if a Telegram user is linked to an Agent OTP account
   */
  async checkTelegramLink(
    telegramUserId: number
  ): Promise<{ linked: boolean; userId?: string }> {
    try {
      return await this.request(
        'GET',
        `/v1/users/telegram/${telegramUserId}`
      );
    } catch {
      return { linked: false };
    }
  }
}

export const apiClient = new AgentOTPApiClient();
