# Agent OTP

[![npm version](https://badge.fury.io/js/%40orrisai%2Fagent-otp-sdk.svg)](https://www.npmjs.com/package/@orrisai/agent-otp-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**[English](./README.md) | [中文](./README.zh-CN.md)**

A secure OTP Relay Service for AI Agents. Help your AI agents receive verification codes (SMS/email OTPs) securely with end-to-end encryption, user approval, and automatic deletion.

## The Problem

AI agents often need verification codes to complete tasks like signing up for services or logging in on behalf of users. Traditional approaches are risky:

| Approach | Risk |
|----------|------|
| Give agent full email access | Agent can read ALL emails (banking, medical, personal) |
| Forward all SMS to agent | Agent can intercept ALL messages (2FA, verification codes) |
| User manually copy-pastes | Breaks automation, causes user fatigue |

## The Solution

Agent OTP provides a **secure relay** for verification codes:

- **End-to-End Encryption**: OTPs encrypted with agent's public key - only the agent can decrypt
- **User Approval**: You control which OTPs your agents can access
- **One-Time Read**: OTPs auto-deleted after consumption
- **Multi-Source Capture**: SMS (Android app), Email (Gmail/IMAP)
- **Minimal Exposure**: Agent only gets specific OTPs from approved senders

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           User's Environment                            │
│  ┌──────────────┐                              ┌──────────────────────┐ │
│  │   Android    │  Capture SMS OTP             │   Email (Gmail)      │ │
│  │   Phone App  │ ─────────────┐               │   Email Integration  │ │
│  └──────────────┘              │               └──────────┬───────────┘ │
│                                │                          │             │
│                                ▼                          ▼             │
│                    ┌─────────────────────────────────────────┐          │
│                    │        Agent OTP Service                │          │
│                    │  (Stores encrypted OTP, user approval)  │          │
│                    └─────────────────┬───────────────────────┘          │
│                                      │                                  │
│                                      │ User approves via Telegram/Web   │
│                                      │                                  │
└──────────────────────────────────────┼──────────────────────────────────┘
                                       │
                                       │ Encrypted OTP
                                       ▼
                             ┌──────────────────┐
                             │    AI Agent      │
                             │ (Decrypts with   │
                             │  private key)    │
                             └──────────────────┘
```

### Step-by-Step Flow

#### 1. Agent Generates Key Pair

The agent generates an RSA key pair. The private key stays with the agent, public key is sent to Agent OTP:

```typescript
import { generateKeyPair, exportPublicKey } from '@orrisai/agent-otp-sdk';

// Generate key pair (once per agent session)
const { publicKey, privateKey } = await generateKeyPair();

// Private key stored locally, NEVER sent out
```

#### 2. Agent Requests OTP

When the agent needs a verification code (e.g., signing up for a service):

```typescript
const client = new AgentOTPClient({ apiKey: 'ak_xxx' });

const request = await client.requestOTP({
  reason: 'Sign up for Acme website',      // Tell user why
  expectedSender: 'Acme',                   // Expected sender
  filter: {
    sources: ['email'],                     // Only email OTPs
    senderPattern: '*@acme.com',            // Only from acme.com
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,
  timeout: 120000,
});
```

#### 3. User Receives Approval Request

User gets notified via Telegram Bot or Dashboard:

```
🔔 Agent Requests OTP Access

Reason: Sign up for Acme website
Expected Sender: Acme
Source: Email

[✅ Approve]  [❌ Deny]
```

#### 4. System Waits for OTP

After user approves, Agent OTP monitors for the OTP:

- **SMS**: Android App listens for SMS matching `senderPattern`
- **Email**: Email integration monitors inbox for matching sender

#### 5. OTP Captured and Encrypted

When Acme sends the verification email:

```
From: noreply@acme.com
Subject: Your verification code
Body: Your code is 847291
```

Agent OTP service:
1. Captures the email
2. Extracts code `847291`
3. **Encrypts with agent's public key** (only agent can decrypt)
4. Stores encrypted data

#### 6. Agent Consumes OTP

```typescript
if (request.status === 'otp_received') {
  // Decrypt with private key
  const { code } = await client.consumeOTP(request.id, privateKey);

  console.log('OTP:', code);  // 847291

  // Use the code
  await completeRegistration(code);
}
```

#### 7. OTP Auto-Deleted

After consumption, OTP is immediately deleted from server. Cannot be read again.

## Security Design

| Feature | Implementation |
|---------|----------------|
| **End-to-End Encryption** | OTP encrypted with agent's public key, only private key holder can decrypt |
| **Server Cannot Read** | Server stores encrypted data, cannot read plaintext codes |
| **User Approval** | Every OTP request requires explicit user approval |
| **One-Time Read** | Deleted immediately after consumption, no replay possible |
| **Minimal Exposure** | Agent only gets specific OTPs from approved senders, not all messages |

## Implementation Status

> Last updated: 2026-01-30

| Component | Status | Description |
|-----------|--------|-------------|
| **TypeScript SDK** | ✅ Complete | `requestOTP()`, `consumeOTP()`, crypto utilities |
| **Shared Package** | ✅ Complete | Types, constants, Zod schemas |
| **API Service** | ⚠️ Partial | Route structure exists, some endpoints are placeholders |
| **Documentation Website** | ✅ Complete | 35 pages with full documentation |
| **Telegram Bot** | ✅ Complete | User approval notifications via Grammy |
| **Email Integration** | ✅ Complete | Gmail API support, OTP extraction |
| **Android App (React Native)** | ✅ Complete | SMS OTP capture with Expo |
| **Web Dashboard** | ❌ Not Started | Web-based approval and management |

### Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              Agent OTP System                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐        ┌─────────────┐        ┌─────────────────────────┐  │
│   │  AI Agent   │──SDK──▶│   API       │◀──────▶│  Database               │  │
│   │  (requests) │        │  (Hono.js)  │        │  (PostgreSQL/Drizzle)   │  │
│   └─────────────┘        └──────┬──────┘        └─────────────────────────┘  │
│                                 │                                            │
│         ┌───────────────────────┼───────────────────────┐                   │
│         │                       │                       │                   │
│         ▼                       ▼                       ▼                   │
│   ┌───────────────┐     ┌───────────────┐     ┌───────────────────────┐     │
│   │ Telegram Bot  │     │ Email Service │     │ Android App           │     │
│   │ (Grammy)      │     │ (Gmail API)   │     │ (React Native/Expo)   │     │
│   │               │     │               │     │                       │     │
│   │ • Approvals   │     │ • OTP capture │     │ • SMS OTP capture     │     │
│   │ • Denials     │     │ • Filtering   │     │ • Push notifications  │     │
│   │ • Status      │     │ • Encryption  │     │ • Secure storage      │     │
│   └───────────────┘     └───────────────┘     └───────────────────────┘     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### What's Working

- ✅ SDK for AI agents to request and consume OTPs
- ✅ API service for OTP management
- ✅ Telegram bot for user approvals
- ✅ Email integration for email OTP capture
- ✅ Android app for SMS OTP capture

### What's Missing

- ❌ Web dashboard for management
- ❌ iOS app (Android only currently)
- ❌ Production deployment (self-hosted only)

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

// Generate encryption keys
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
  waitForOTP: true,
  timeout: 120000,
});

// Consume the OTP
if (request.status === 'otp_received') {
  const { code } = await client.consumeOTP(request.id, privateKey);
  console.log('Received OTP:', code);
}
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

## Project Structure

```
agent-otp/
├── apps/
│   ├── api/              # Main API service (Hono + Cloudflare Workers)
│   ├── website/          # Documentation website (Next.js)
│   ├── telegram-bot/     # Telegram approval bot (Grammy)
│   ├── email-integration/# Email OTP capture (Gmail API)
│   ├── mobile/           # React Native SMS app (Expo)
│   └── dashboard/        # Web Dashboard - Coming soon
├── packages/
│   ├── sdk/              # TypeScript SDK
│   └── shared/           # Shared types and utilities
├── docs/                 # Internal documentation
└── docker-compose.yml    # Local development setup
```

## Manual Configuration Required

The following components require manual configuration before use:

### Telegram Bot

1. Create a bot with [@BotFather](https://t.me/botfather) to get `TELEGRAM_BOT_TOKEN`
2. Set your Telegram user ID as `TELEGRAM_ADMIN_ID`
3. Configure webhook URL for production deployment

```bash
# apps/telegram-bot/.env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_ID=your_telegram_id
AGENT_OTP_API_URL=http://localhost:8787
AGENT_OTP_API_KEY=your_api_key
```

### Email Integration

1. Enable Gmail API in Google Cloud Console
2. Create OAuth2 credentials (Desktop app type)
3. Run the authentication flow to get refresh token

```bash
# apps/email-integration/.env
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
AGENT_OTP_API_URL=http://localhost:8787
AGENT_OTP_API_KEY=your_api_key
```

### Android App (React Native)

1. Install [Expo CLI](https://docs.expo.dev/get-started/installation/)
2. Configure API endpoint in app settings
3. Build APK or use Expo Go for development

```bash
cd apps/mobile
bun install
bun run android  # Or use Expo Go
```

**Note**: SMS permissions require physical Android device (not emulator).

## Documentation

Full documentation is available at [agentotp.com/docs](https://agentotp.com/docs).

- [Quick Start Guide](https://agentotp.com/docs/quickstart)
- [SDK Reference](https://agentotp.com/docs/sdk/typescript)
- [How It Works](https://agentotp.com/docs/concepts/how-it-works)
- [End-to-End Encryption](https://agentotp.com/docs/concepts/encryption)
- [OTP Sources](https://agentotp.com/docs/concepts/sources)

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0
- [Docker](https://www.docker.com/) and Docker Compose

### Setup

```bash
git clone https://github.com/orristech/agent-otp.git
cd agent-otp
bun install
docker compose up -d
cp .env.example .env
bun dev
```

The API will be available at `http://localhost:8787`.

### Running Tests

```bash
bun test              # Run all tests
bun test --run        # Single run (no watch)
bun test:coverage     # With coverage
```

## SDK API Reference

### Client Methods

```typescript
requestOTP(options: RequestOTPOptions): Promise<OTPRequestResult>
getOTPStatus(requestId: string): Promise<OTPStatus>
consumeOTP(requestId: string, privateKey: CryptoKey): Promise<OTPConsumeResult>
cancelOTPRequest(requestId: string): Promise<void>
```

### Crypto Utilities

```typescript
generateKeyPair(): Promise<CryptoKeyPair>
exportPublicKey(key: CryptoKey): Promise<string>
importPrivateKey(keyData: string): Promise<CryptoKey>
decryptOTPPayload(encrypted: string, privateKey: CryptoKey): Promise<string>
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Documentation](https://agentotp.com/docs)
- [GitHub Issues](https://github.com/orristech/agent-otp/issues)
- [Email Support](mailto:support@agentotp.com)
