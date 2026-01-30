# @orrisai/agent-otp-sdk

Secure OTP Relay SDK for AI Agents.

Agent OTP helps AI agents receive verification codes (SMS/email OTPs) securely with:
- **End-to-end encryption** - Only your agent can decrypt the OTP
- **User approval** - Users control which OTPs agents can access
- **One-time read** - OTPs are auto-deleted after consumption

## Installation

```bash
npm install @orrisai/agent-otp-sdk
```

## Quick Start

```typescript
import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey
} from '@orrisai/agent-otp-sdk';

// Initialize client
const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});

// Generate encryption keys (do this once, store private key securely)
const { publicKey, privateKey } = await generateKeyPair();

// Request an OTP
const request = await client.requestOTP({
  reason: 'Sign up for Acme service',
  expectedSender: 'Acme',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,
  timeout: 120000, // Wait up to 2 minutes
});

// Consume the OTP (decrypts and deletes from server)
if (request.status === 'otp_received') {
  const { code, metadata } = await client.consumeOTP(request.id, privateKey);
  console.log('OTP code:', code);
  console.log('From:', metadata.sender);
}
```

## API Reference

### `AgentOTPClient`

#### Constructor Options

```typescript
interface AgentOTPClientConfig {
  apiKey: string;        // Required: Your API key
  baseUrl?: string;      // Optional: API URL (default: https://api.agentotp.com)
  timeout?: number;      // Optional: Request timeout in ms (default: 30000)
  retryAttempts?: number; // Optional: Retry count (default: 3)
}
```

#### Methods

##### `requestOTP(options)`

Request an OTP from the relay service.

```typescript
const request = await client.requestOTP({
  reason: 'Why you need the OTP',        // Shown to user
  expectedSender: 'Google',              // Expected sender
  filter: {
    sources: ['sms', 'email'],           // OTP sources to accept
    senderPattern: '*@google.com',       // Sender pattern (wildcards supported)
  },
  publicKey: 'base64-encoded-key',       // Your public key for encryption
  ttl: 300,                              // Request TTL in seconds
  waitForOTP: true,                      // Wait for OTP to arrive
  timeout: 120000,                       // Wait timeout in ms
  onPendingApproval: (info) => {         // Called when pending approval
    console.log('Approve at:', info.approvalUrl);
  },
});
```

##### `getOTPStatus(requestId)`

Check the current status of an OTP request.

```typescript
const status = await client.getOTPStatus('otp_123');
// status.status: 'pending_approval' | 'approved' | 'otp_received' | 'consumed' | 'denied' | 'expired'
```

##### `consumeOTP(requestId, privateKey)`

Consume and decrypt the OTP (one-time read).

```typescript
const { code, fullMessage, metadata } = await client.consumeOTP('otp_123', privateKey);
```

##### `cancelOTPRequest(requestId)`

Cancel a pending OTP request.

```typescript
await client.cancelOTPRequest('otp_123');
```

### Encryption Utilities

```typescript
import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPrivateKey,
} from '@orrisai/agent-otp-sdk';

// Generate a new key pair
const { publicKey, privateKey } = await generateKeyPair();

// Export keys for storage
const publicKeyBase64 = await exportPublicKey(publicKey);
const privateKeyBase64 = await exportPrivateKey(privateKey);

// Import a stored private key
const importedKey = await importPrivateKey(privateKeyBase64);
```

## Error Handling

```typescript
import {
  OTPNotFoundError,
  OTPExpiredError,
  OTPAlreadyConsumedError,
  OTPApprovalDeniedError,
  DecryptionError,
} from '@orrisai/agent-otp-sdk';

try {
  const { code } = await client.consumeOTP(requestId, privateKey);
} catch (error) {
  if (error instanceof OTPApprovalDeniedError) {
    console.log('User denied access:', error.reason);
  } else if (error instanceof OTPExpiredError) {
    console.log('Request expired at:', error.expiredAt);
  } else if (error instanceof DecryptionError) {
    console.log('Failed to decrypt - wrong private key?');
  }
}
```

## Self-Hosting

For self-hosted deployments, configure the base URL:

```typescript
const client = new AgentOTPClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://otp.your-domain.com',
});
```

See [Self-Hosting Guide](https://agentotp.com/docs/guides/self-hosting) for setup instructions.

## Links

- [Documentation](https://agentotp.com/docs)
- [GitHub](https://github.com/orristech/agent-otp)
- [Changelog](./CHANGELOG.md)

## License

MIT
