# Agent OTP - Product Requirements Document

**Version:** 0.2.0
**Last Updated:** 2026-01-30
**Status:** Active Development

---

## Executive Summary

Agent OTP is a **Secure OTP Relay Service** for AI Agents. It enables AI agents to securely receive verification codes (SMS/email OTPs) while maintaining user control, end-to-end encryption, and comprehensive audit trails.

### Problem Statement

AI agents increasingly need to perform tasks that require verification codes:
- Signing up for services on behalf of users
- Logging into accounts that require 2FA
- Completing purchases that require SMS verification
- Verifying email addresses during automation flows

Currently, users must either:
1. Give agents direct access to SMS/email (dangerous - full access to all messages)
2. Manually copy-paste OTPs to agents (tedious - defeats automation purpose)
3. Disable 2FA (insecure - compromises account security)

### Solution

Agent OTP provides a secure relay service that:
- **Captures** OTPs from SMS (Android) and Email (Gmail/IMAP)
- **Encrypts** codes end-to-end with agent's public key
- **Requires user approval** before sharing any OTP
- **Auto-deletes** after one-time read
- **Logs** every access for audit purposes

---

## Core Principles

1. **Zero Trust** - Agent OTP service cannot read OTP content (E2E encrypted)
2. **User Control** - Every OTP access requires explicit user approval
3. **Minimal Exposure** - One-time read, auto-delete after consumption
4. **Full Transparency** - Complete audit trail of all requests and accesses
5. **Framework Agnostic** - Works with any AI agent framework

---

## User Personas

### Primary: AI Agent Developer
- Building automation workflows with AI agents
- Needs agents to complete verification flows
- Wants security without sacrificing automation capability
- Technical, comfortable with SDKs and APIs

### Secondary: AI Agent End User
- Uses AI agents built by developers
- Approves OTP access requests
- Wants simple, quick approval flow
- May not be technical

---

## Feature Requirements

### P0 - Core Features (v0.2.0)

#### OTP Request Flow
- Agent requests OTP access via SDK
- User receives notification (Telegram/Email/Dashboard)
- User approves/denies request
- Agent receives encrypted OTP (if approved)
- OTP auto-deleted after consumption

#### End-to-End Encryption
- RSA-OAEP 2048-bit encryption
- Agent generates key pair locally
- Only agent's private key can decrypt OTP
- Service never sees plaintext OTP

#### OTP Sources
- **SMS (Android)** - Dedicated Android app captures SMS OTPs
- **Email (Gmail/IMAP)** - Email integration for email verification codes

#### SDK Features (TypeScript)
```typescript
// Core methods
requestOTP(options: RequestOTPOptions): Promise<OTPRequestResult>
getOTPStatus(requestId: string): Promise<OTPStatus>
consumeOTP(requestId: string, privateKey: CryptoKey): Promise<OTPConsumeResult>
cancelOTPRequest(requestId: string): Promise<void>

// Crypto utilities
generateKeyPair(): Promise<CryptoKeyPair>
exportPublicKey(key: CryptoKey): Promise<string>
importPrivateKey(keyData: string): Promise<CryptoKey>
decryptOTPPayload(encrypted: string, privateKey: CryptoKey): Promise<string>
```

### P1 - Enhanced Features (v0.3.0)

#### Auto-Approval Rules
- Define trusted senders (e.g., *@company.com)
- Auto-approve OTPs from trusted sources
- Rate limiting and quotas

#### Dashboard
- View all OTP requests and history
- Manage agent registrations
- Configure approval rules
- Export audit logs

#### Python SDK
- Feature parity with TypeScript SDK
- LangChain/CrewAI integration helpers

### P2 - Advanced Features (v0.4.0+)

#### WhatsApp Integration
- Capture OTPs from WhatsApp messages
- Business account support

#### Telegram Bot Approvals
- Real-time approval via Telegram
- Quick approve/deny buttons

#### Multi-User Support
- Team workspaces
- Role-based access control
- Shared agent pools

---

## Technical Architecture

### System Components

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Android    │     │   Email      │     │   WhatsApp   │
│   SMS App    │     │  Connector   │     │  Connector   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   Agent OTP API  │
                   │   (Hono + CF)    │
                   └────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │  Redis   │  │ Postgres │  │ Telegram │
       │ (Cache)  │  │   (DB)   │  │   Bot    │
       └──────────┘  └──────────┘  └──────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   AI Agent SDK   │
                   │  (TS/Python)     │
                   └──────────────────┘
```

### OTP Request States

```
pending_approval → approved → otp_received → consumed
       ↓              ↓            ↓
    denied         expired      expired
       ↓
   cancelled
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/otp/request` | Create new OTP request |
| GET | `/v1/otp/:id` | Get request status |
| POST | `/v1/otp/:id/consume` | Consume encrypted OTP |
| DELETE | `/v1/otp/:id` | Cancel request |
| POST | `/v1/otp/:id/receive` | Internal: receive captured OTP |

### Data Models

```typescript
interface OTPRequest {
  id: string;                    // otp_xxxx
  agentId: string;               // Agent that requested
  userId: string;                // User who owns the request
  reason: string;                // Why agent needs OTP
  expectedSender?: string;       // Expected sender hint
  filter?: OTPSourceFilter;      // Source/sender filters
  publicKey: string;             // Agent's RSA public key
  status: OTPRequestStatus;      // Current state
  encryptedPayload?: string;     // Encrypted OTP (when received)
  source?: OTPSource;            // Where OTP came from
  sender?: string;               // Actual sender
  expiresAt: Date;               // Request expiration
  createdAt: Date;
  updatedAt: Date;
}

interface OTPSourceFilter {
  sources?: OTPSource[];         // ['sms', 'email']
  senderPattern?: string;        // Glob pattern: '*@acme.com'
  contentPattern?: string;       // Regex for OTP format
}
```

---

## Security Considerations

### Encryption
- RSA-OAEP with 2048-bit keys
- SHA-256 hash function
- Web Crypto API (browser-native)
- Private keys never leave agent environment

### Data Protection
- OTPs encrypted before storage
- Auto-deletion after consumption
- No plaintext OTP logging
- Redis TTL for automatic expiration

### Access Control
- API key authentication per agent
- User approval required for each request
- Rate limiting per agent/user
- IP allowlisting (optional)

### Audit Trail
- All requests logged with timestamps
- Approval decisions recorded
- Consumption events tracked
- Exportable for compliance

---

## Success Metrics

### Adoption
- Number of registered agents
- Daily OTP requests
- Active users (approvals/denials)

### Performance
- Request-to-approval latency (p50, p95)
- OTP delivery latency (capture to consumption)
- API response times

### Security
- Zero unauthorized OTP accesses
- Encryption integrity (no plaintext leaks)
- Audit log completeness

### Developer Experience
- Time to first OTP request
- SDK adoption rate (TypeScript vs Python)
- Documentation satisfaction

---

## Roadmap

### v0.2.0 (Current)
- [x] TypeScript SDK with E2E encryption
- [x] Core API endpoints
- [x] Documentation site
- [ ] Android SMS capture app
- [ ] Email integration (Gmail)

### v0.3.0
- [ ] Python SDK
- [ ] Dashboard UI
- [ ] Auto-approval rules
- [ ] LangChain integration

### v0.4.0
- [ ] WhatsApp integration
- [ ] Telegram bot approvals
- [ ] Multi-user workspaces
- [ ] Enterprise features

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| OTP | One-Time Password/Passcode - verification code |
| E2E | End-to-End encryption |
| Agent | AI system that needs OTP access |
| Relay | Service that captures and forwards OTPs |
| Consume | One-time read of an OTP, triggering deletion |

### References

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [RSA-OAEP](https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
