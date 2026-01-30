# Agent OTP

[![npm version](https://badge.fury.io/js/%40orrisai%2Fagent-otp-sdk.svg)](https://www.npmjs.com/package/@orrisai/agent-otp-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A secure OTP Relay Service for AI Agents. Help your AI agents receive verification codes (SMS/email OTPs) securely with end-to-end encryption, user approval, and automatic deletion.

## Overview

Agent OTP provides a security layer for AI agents that need to receive verification codes. Instead of giving agents direct access to SMS or email, Agent OTP enables:

- **End-to-End Encryption**: OTPs encrypted with agent's public key - only the agent can decrypt
- **User Approval**: Control which OTPs your agents can access
- **One-Time Read**: OTPs auto-deleted after consumption
- **Multi-Source Capture**: SMS (Android app), Email (Gmail/IMAP)
- **Full Audit Trail**: Track every OTP request and access

## Quick Start

### 1. Install the SDK

```bash
npm install @orrisai/agent-otp-sdk
# or
bun add @orrisai/agent-otp-sdk
```

### 2. Get an API Key

Run a self-hosted instance and create an API key:

```bash
docker compose exec api bun run cli agent:create --name "my-assistant"
```

### 3. Request OTPs

```typescript
import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey,
} from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY,
});

// Generate encryption keys (store private key securely)
const { publicKey, privateKey } = await generateKeyPair();

// Request an OTP
const request = await client.requestOTP({
  reason: 'Sign up verification for Acme Inc',
  expectedSender: 'Acme',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,  // Block until OTP arrives or timeout
  timeout: 120000,   // 2 minutes
});

// Consume the OTP (one-time read, then deleted)
if (request.status === 'otp_received') {
  const { code } = await client.consumeOTP(request.id, privateKey);
  console.log('Received OTP:', code);
}
```

## How It Works

```
┌──────────────┐     1. Request OTP        ┌──────────────┐
│   AI Agent   │ ─────────────────────────►│  Agent OTP   │
│   + SDK      │   (with public key)       │     API      │
└──────────────┘                           └──────────────┘
       │                                          │
       │                                          │ 2. Notify User
       │                                          │    for Approval
       │                                          ▼
       │                                   ┌──────────────┐
       │                                   │  User Device │
       │                                   │  (Telegram)  │
       │                                   └──────────────┘
       │                                          │
       │                    3. User Approves      │
       │ ◄────────────────────────────────────────┤
       │                                          │
       │         4. OTP Captured (SMS/Email)      │
       │ ◄────────────────────────────────────────┤
       │         (encrypted with public key)      │
       │                                          │
       ▼                                          │
┌──────────────┐     5. Consume OTP        ┌──────────────┐
│    Agent     │ ─────────────────────────►│   Decrypt    │
│  Decrypts    │   (one-time read)         │  & Delete    │
└──────────────┘                           └──────────────┘
```

## OTP Request States

| Status | Description |
|--------|-------------|
| `pending_approval` | Waiting for user to approve |
| `approved` | User approved, waiting for OTP to arrive |
| `otp_received` | OTP captured and ready to consume |
| `consumed` | OTP has been read and deleted |
| `denied` | User denied the request |
| `expired` | Request expired before completion |
| `cancelled` | Request was cancelled |

## Documentation

Full documentation is available at [agentotp.com/docs](https://agentotp.com/docs).

- [Quick Start Guide](https://agentotp.com/docs/quickstart)
- [SDK Reference](https://agentotp.com/docs/sdk/typescript)
- [How It Works](https://agentotp.com/docs/concepts/how-it-works)
- [End-to-End Encryption](https://agentotp.com/docs/concepts/encryption)
- [OTP Sources](https://agentotp.com/docs/concepts/sources)

## Project Structure

```
agent-otp/
├── apps/
│   ├── api/              # Main API service (Hono + Cloudflare Workers)
│   ├── website/          # Documentation website (Next.js)
│   ├── dashboard/        # Web Dashboard (Next.js) - Coming soon
│   └── telegram-bot/     # Telegram approval bot - Coming soon
├── packages/
│   ├── sdk/              # TypeScript SDK
│   └── shared/           # Shared types and utilities
├── docs/                 # Internal documentation
└── docker-compose.yml    # Local development setup
```

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0
- [Docker](https://www.docker.com/) and Docker Compose

### Setup

1. Clone the repository:
```bash
git clone https://github.com/orristech/agent-otp.git
cd agent-otp
```

2. Install dependencies:
```bash
bun install
```

3. Start the local database and Redis:
```bash
docker compose up -d
```

4. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Start the development server:
```bash
bun dev
```

The API will be available at `http://localhost:8787`.

### Running Tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun test:coverage

# Run tests for a specific package
bun test --filter @orrisai/agent-otp-sdk
```

## SDK API Reference

### Client Methods

```typescript
// Create a new OTP request
requestOTP(options: RequestOTPOptions): Promise<OTPRequestResult>

// Check request status
getOTPStatus(requestId: string): Promise<OTPStatus>

// Consume OTP (one-time read, then deleted)
consumeOTP(requestId: string, privateKey: CryptoKey): Promise<OTPConsumeResult>

// Cancel a pending request
cancelOTPRequest(requestId: string): Promise<void>
```

### Crypto Utilities

```typescript
// Generate RSA-OAEP key pair for E2E encryption
generateKeyPair(): Promise<CryptoKeyPair>

// Export public key for transmission
exportPublicKey(key: CryptoKey): Promise<string>

// Import private key from stored data
importPrivateKey(keyData: string): Promise<CryptoKey>

// Decrypt received OTP payload
decryptOTPPayload(encrypted: string, privateKey: CryptoKey): Promise<string>
```

### Request Options

```typescript
interface RequestOTPOptions {
  reason: string;              // Why agent needs OTP
  expectedSender?: string;     // Hint for which OTP to capture
  filter?: {
    sources?: ('sms' | 'email' | 'whatsapp')[];
    senderPattern?: string;    // Glob pattern: '*@acme.com'
  };
  publicKey: string;           // Agent's RSA public key
  ttl?: number;                // Request TTL in seconds (default: 300)
  waitForOTP?: boolean;        // Block until OTP arrives
  timeout?: number;            // Wait timeout in ms (default: 120000)
}
```

## Security

### Encryption

- **Algorithm**: RSA-OAEP with 2048-bit keys
- **Hash**: SHA-256
- **Implementation**: Web Crypto API (browser-native)

### Best Practices

- **Never commit secrets**: All sensitive configuration should be in `.env` files
- **Store private keys securely**: Agent private keys should be encrypted at rest
- **Use environment variables**: API keys should always be in environment variables
- **Rotate API keys**: Regularly rotate your Agent OTP API keys

### Reporting Vulnerabilities

If you discover a security vulnerability, please email security@agentotp.com. Do not open public issues for security vulnerabilities.

## Roadmap

- [x] TypeScript SDK with E2E encryption
- [x] Core API with OTP request/consume
- [x] Documentation website
- [ ] Android SMS capture app
- [ ] Email integration (Gmail/IMAP)
- [ ] Web Dashboard
- [ ] Telegram Bot for approvals
- [ ] Python SDK
- [ ] LangChain integration
- [ ] CrewAI integration

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `bun test`
5. Commit with a descriptive message
6. Push and open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Documentation](https://agentotp.com/docs)
- [GitHub Issues](https://github.com/orristech/agent-otp/issues)
- [Email Support](mailto:support@agentotp.com)
