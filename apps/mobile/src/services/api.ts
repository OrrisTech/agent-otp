/**
 * Agent OTP API client for mobile app
 */

import type { OTPRequest, AppConfig } from '@/types';

export class AgentOTPApiClient {
  private baseUrl: string;
  private apiKey: string;
  private deviceId: string;

  constructor(config: AppConfig) {
    this.baseUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.deviceId = config.deviceId;
  }

  /**
   * Make an authenticated request to the API
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
        'X-Device-Id': this.deviceId,
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
   * Register this device with the API
   */
  async registerDevice(deviceInfo: {
    platform: 'android' | 'ios';
    model: string;
    osVersion: string;
  }): Promise<{ success: boolean; deviceId: string }> {
    return this.request('POST', '/v1/devices/register', {
      ...deviceInfo,
      deviceId: this.deviceId,
    });
  }

  /**
   * Get pending OTP requests that need SMS monitoring
   */
  async getPendingRequests(): Promise<{ requests: OTPRequest[] }> {
    return this.request('GET', '/v1/otp/pending?source=sms');
  }

  /**
   * Submit an encrypted OTP for a request
   */
  async submitOTP(submission: {
    requestId: string;
    encryptedPayload: string;
    source: 'sms';
    metadata: {
      sender: string;
      receivedAt: string;
      confidence: number;
    };
  }): Promise<{ success: boolean; message: string }> {
    return this.request(
      'POST',
      `/v1/otp/${submission.requestId}/receive`,
      submission
    );
  }

  /**
   * Get a specific request's public key for encryption
   */
  async getRequestPublicKey(requestId: string): Promise<{ publicKey: string }> {
    return this.request('GET', `/v1/otp/${requestId}/public-key`);
  }

  /**
   * Link device to user account via QR code token
   */
  async linkDevice(linkToken: string): Promise<{
    success: boolean;
    userId: string;
    message: string;
  }> {
    return this.request('POST', '/v1/devices/link', {
      deviceId: this.deviceId,
      linkToken,
    });
  }

  /**
   * Check device link status
   */
  async checkLinkStatus(): Promise<{
    isLinked: boolean;
    userId?: string;
  }> {
    try {
      return await this.request('GET', `/v1/devices/${this.deviceId}/status`);
    } catch {
      return { isLinked: false };
    }
  }

  /**
   * Approve an OTP request
   */
  async approveRequest(requestId: string): Promise<{ success: boolean }> {
    return this.request('POST', `/v1/otp/${requestId}/approve`, {});
  }

  /**
   * Deny an OTP request
   */
  async denyRequest(requestId: string): Promise<{ success: boolean }> {
    return this.request('POST', `/v1/otp/${requestId}/deny`, {});
  }

  /**
   * Verify API key is valid
   */
  async verifyApiKey(): Promise<boolean> {
    try {
      await this.request('GET', '/v1/auth/verify');
      return true;
    } catch {
      return false;
    }
  }
}

// Global API client instance
let apiClient: AgentOTPApiClient | null = null;

/**
 * Initialize API client with config
 */
export function initializeApiClient(config: AppConfig): void {
  apiClient = new AgentOTPApiClient(config);
}

/**
 * Get the API client instance
 */
function getClient(): AgentOTPApiClient {
  if (!apiClient) {
    throw new Error('API client not initialized. Call initializeApiClient first.');
  }
  return apiClient;
}

/**
 * Fetch pending OTP requests
 */
export async function fetchPendingRequests(): Promise<OTPRequest[]> {
  const client = getClient();
  const response = await client.getPendingRequests();
  return response.requests;
}

/**
 * Approve an OTP request
 */
export async function approveRequest(requestId: string): Promise<void> {
  const client = getClient();
  await client.approveRequest(requestId);
}

/**
 * Deny an OTP request
 */
export async function denyRequest(requestId: string): Promise<void> {
  const client = getClient();
  await client.denyRequest(requestId);
}

/**
 * Verify API key is valid
 */
export async function verifyApiKey(apiKey: string): Promise<boolean> {
  // Create a temporary client to verify the key
  const tempClient = new AgentOTPApiClient({
    apiKey,
    apiUrl: 'https://api.agent-otp.com', // Default API URL
    deviceId: 'temp',
    isLinked: false,
  });
  return tempClient.verifyApiKey();
}

/**
 * Submit encrypted OTP to API
 */
export async function submitOTP(
  requestId: string,
  encryptedPayload: string,
  sender: string,
  receivedAt: Date,
  confidence: number
): Promise<void> {
  const client = getClient();
  await client.submitOTP({
    requestId,
    encryptedPayload,
    source: 'sms',
    metadata: {
      sender,
      receivedAt: receivedAt.toISOString(),
      confidence,
    },
  });
}
