/**
 * Gmail Watcher - Monitors Gmail for incoming OTPs using Gmail API
 */

import { google, type gmail_v1 } from 'googleapis';
import { config } from '../config.js';
import {
  extractOTP,
  matchesSenderPattern,
  mentionsExpectedSender,
} from './otp-extractor.js';

/**
 * Pending OTP request to match against incoming emails
 */
export interface PendingOTPRequest {
  requestId: string;
  publicKey: string;
  expectedSender?: string;
  senderPattern?: string;
  sources: string[];
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Matched OTP result
 */
export interface MatchedOTP {
  requestId: string;
  code: string;
  confidence: number;
  emailId: string;
  from: string;
  subject: string;
  receivedAt: Date;
}

/**
 * Gmail OAuth tokens
 */
export interface GmailTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}

/**
 * Gmail Watcher class
 */
export class GmailWatcher {
  private gmail: gmail_v1.Gmail;
  private pendingRequests: Map<string, PendingOTPRequest> = new Map();
  private lastHistoryId: string | null = null;
  private isWatching = false;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(tokens: GmailTokens) {
    const oauth2Client = new google.auth.OAuth2(
      config.GOOGLE_CLIENT_ID,
      config.GOOGLE_CLIENT_SECRET,
      config.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiryDate,
    });

    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  /**
   * Add a pending OTP request to watch for
   */
  addPendingRequest(request: PendingOTPRequest): void {
    this.pendingRequests.set(request.requestId, request);
    console.log(`Added pending request: ${request.requestId}`);
  }

  /**
   * Remove a pending OTP request
   */
  removePendingRequest(requestId: string): void {
    this.pendingRequests.delete(requestId);
    console.log(`Removed pending request: ${requestId}`);
  }

  /**
   * Start watching for new emails
   */
  async startWatching(
    onOTPFound: (match: MatchedOTP) => Promise<void>
  ): Promise<void> {
    if (this.isWatching) {
      console.log('Already watching');
      return;
    }

    this.isWatching = true;

    // Get initial history ID
    const profile = await this.gmail.users.getProfile({ userId: 'me' });
    this.lastHistoryId = profile.data.historyId ?? null;

    console.log(`Starting Gmail watch from history ID: ${this.lastHistoryId}`);

    // Poll for new messages
    this.pollInterval = setInterval(async () => {
      try {
        await this.checkNewMessages(onOTPFound);
      } catch (error) {
        console.error('Error checking new messages:', error);
      }
    }, config.POLL_INTERVAL_MS);

    // Clean up expired requests periodically
    setInterval(() => this.cleanupExpiredRequests(), 30000);
  }

  /**
   * Stop watching
   */
  stopWatching(): void {
    this.isWatching = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log('Stopped Gmail watch');
  }

  /**
   * Check for new messages since last check
   */
  private async checkNewMessages(
    onOTPFound: (match: MatchedOTP) => Promise<void>
  ): Promise<void> {
    if (!this.lastHistoryId || this.pendingRequests.size === 0) {
      return;
    }

    try {
      const history = await this.gmail.users.history.list({
        userId: 'me',
        startHistoryId: this.lastHistoryId,
        historyTypes: ['messageAdded'],
      });

      if (!history.data.history) {
        return;
      }

      // Update history ID
      this.lastHistoryId = history.data.historyId ?? this.lastHistoryId;

      // Process new messages
      for (const record of history.data.history) {
        if (!record.messagesAdded) continue;

        for (const added of record.messagesAdded) {
          if (!added.message?.id) continue;

          await this.processMessage(added.message.id, onOTPFound);
        }
      }
    } catch (error) {
      // If history ID is invalid, get new one
      if ((error as { code?: number })?.code === 404) {
        const profile = await this.gmail.users.getProfile({ userId: 'me' });
        this.lastHistoryId = profile.data.historyId ?? null;
      } else {
        throw error;
      }
    }
  }

  /**
   * Process a single message to check for OTP
   */
  private async processMessage(
    messageId: string,
    onOTPFound: (match: MatchedOTP) => Promise<void>
  ): Promise<void> {
    const message = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const headers = message.data.payload?.headers ?? [];
    const from = headers.find((h) => h.name?.toLowerCase() === 'from')?.value ?? '';
    const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value ?? '';
    const date = headers.find((h) => h.name?.toLowerCase() === 'date')?.value;

    // Get body text
    const body = this.extractBody(message.data.payload);

    // Try to extract OTP
    const extracted = extractOTP(subject, body);
    if (!extracted) {
      return;
    }

    console.log(`Found potential OTP in message ${messageId}: ${extracted.code}`);

    // Match against pending requests
    for (const [requestId, request] of this.pendingRequests) {
      if (!request.sources.includes('email')) {
        continue;
      }

      // Check sender pattern
      if (request.senderPattern && !matchesSenderPattern(from, request.senderPattern)) {
        continue;
      }

      // Check expected sender mention
      if (request.expectedSender) {
        const content = `${from}\n${subject}\n${body}`;
        if (!mentionsExpectedSender(content, request.expectedSender)) {
          continue;
        }
      }

      // Found a match!
      const match: MatchedOTP = {
        requestId,
        code: extracted.code,
        confidence: extracted.confidence,
        emailId: messageId,
        from,
        subject,
        receivedAt: date ? new Date(date) : new Date(),
      };

      console.log(`Matched OTP for request ${requestId}`);

      // Remove from pending requests
      this.pendingRequests.delete(requestId);

      // Notify
      await onOTPFound(match);
    }
  }

  /**
   * Extract body text from message payload
   */
  private extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
    if (!payload) return '';

    // Direct body data
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    // Multipart - look for text/plain or text/html
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }

      // Fall back to HTML
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
          // Simple HTML stripping
          return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }

      // Recursive for nested multipart
      for (const part of payload.parts) {
        const nested = this.extractBody(part);
        if (nested) return nested;
      }
    }

    return '';
  }

  /**
   * Clean up expired pending requests
   */
  private cleanupExpiredRequests(): void {
    const now = new Date();
    for (const [requestId, request] of this.pendingRequests) {
      if (request.expiresAt < now) {
        this.pendingRequests.delete(requestId);
        console.log(`Expired pending request: ${requestId}`);
      }
    }
  }
}
