/**
 * Agent OTP Email Integration Service
 *
 * This service monitors email accounts for incoming OTP codes and
 * forwards them (encrypted) to the Agent OTP API.
 *
 * Supported providers:
 * - Gmail (via Gmail API with OAuth2)
 * - IMAP (generic email servers) [Coming soon]
 */

import { config } from './config.js';
import { GmailWatcher, type GmailTokens, type MatchedOTP, type PendingOTPRequest } from './services/gmail-watcher.js';
import { apiClient } from './services/api.js';
import { createEncryptedPayload } from './services/encryption.js';
import { createWebhookServer, startWebhookServer } from './webhook-server.js';

/**
 * Start Gmail watcher with public key tracking
 */
async function startGmailWatcher(watcher: GmailWatcher): Promise<void> {
  // Need to track public keys for each request
  const publicKeys = new Map<string, string>();

  // Wrap addPendingRequest to track public keys
  const originalAdd = watcher.addPendingRequest.bind(watcher);
  watcher.addPendingRequest = (request: PendingOTPRequest) => {
    publicKeys.set(request.requestId, request.publicKey);
    originalAdd(request);
  };

  await watcher.startWatching(async (match: MatchedOTP) => {
    const publicKey = publicKeys.get(match.requestId);
    if (publicKey) {
      await handleMatchedOTP(match, publicKey);
      publicKeys.delete(match.requestId);
    }
  });

  console.log('✅ Gmail watcher started');
}

/**
 * Handle matched OTP - encrypt and submit to API
 */
async function handleMatchedOTP(
  match: MatchedOTP,
  publicKey: string
): Promise<void> {
  console.log(`Processing matched OTP for request ${match.requestId}`);

  try {
    // Encrypt the OTP with the agent's public key
    const encryptedPayload = await createEncryptedPayload(match.code, publicKey);

    // Submit to API
    const result = await apiClient.submitOTP({
      requestId: match.requestId,
      encryptedPayload,
      source: 'email',
      metadata: {
        emailId: match.emailId,
        from: match.from,
        subject: match.subject,
        receivedAt: match.receivedAt.toISOString(),
        confidence: match.confidence,
      },
    });

    if (result.success) {
      console.log(`✅ OTP submitted for request ${match.requestId}`);
    } else {
      console.error(`❌ Failed to submit OTP: ${result.message}`);
    }
  } catch (error) {
    console.error(`Error processing OTP for ${match.requestId}:`, error);
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  console.log('📧 Agent OTP Email Integration Service');
  console.log(`   Environment: ${config.NODE_ENV}`);

  let gmailWatcher: GmailWatcher | null = null;

  // Initialize Gmail if configured
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    console.log('   Gmail: Configured (OAuth required)');

    // TODO: Implement OAuth flow for Gmail
    // For now, tokens would be loaded from database or provided via API

    // Example with tokens:
    // const tokens: GmailTokens = {
    //   accessToken: '...',
    //   refreshToken: '...',
    //   expiryDate: Date.now() + 3600000,
    // };
    // gmailWatcher = new GmailWatcher(tokens);
  } else {
    console.log('   Gmail: Not configured (set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)');
  }

  // TODO: Initialize IMAP if configured
  if (config.IMAP_HOST && config.IMAP_USER && config.IMAP_PASSWORD) {
    console.log(`   IMAP: Configured (${config.IMAP_HOST})`);
    // TODO: Implement IMAP watcher
  } else {
    console.log('   IMAP: Not configured');
  }

  // Create and start webhook server
  const app = createWebhookServer(gmailWatcher);
  startWebhookServer(app);

  // Start Gmail watcher if available
  if (gmailWatcher !== null) {
    await startGmailWatcher(gmailWatcher);
  }

  console.log('');
  console.log('Ready to process email OTPs!');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

// Start
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
