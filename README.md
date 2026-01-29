# Agent OTP

[![npm version](https://badge.fury.io/js/%40agent-otp%2Fsdk.svg)](https://www.npmjs.com/package/@orrisai/agent-otp-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A lightweight OTP (One-Time Permission) service for AI Agents, enabling scoped, ephemeral, and human-approved access to sensitive operations.

## Overview

Agent OTP provides a security layer for AI agents (like Moltbot, LangChain, CrewAI, etc.) that need to perform sensitive operations. Instead of giving agents broad, long-lived permissions, Agent OTP enables:

- **Scoped permissions**: Define exactly what an agent can do
- **Ephemeral tokens**: Permissions expire quickly (default: 5 minutes)
- **Human-in-the-loop**: Require approval for sensitive operations
- **Policy-based decisions**: Auto-approve, require-approval, or deny based on rules
- **Full audit trail**: Track every permission request and usage

## Quick Start

### 1. Install the SDK

```bash
npm install @orrisai/agent-otp-sdk
# or
bun add @orrisai/agent-otp-sdk
```

### 2. Get an API Key

Create an account at [agentotp.com](https://agentotp.com) and register an agent to get an API key.

### 3. Request Permissions

```typescript
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_KEY,
});

// Request permission with automatic waiting for approval
const permission = await otp.requestPermission({
  action: 'gmail.send',
  resource: 'email:client@example.com',
  scope: {
    max_emails: 1,
    subject_pattern: '^Invoice.*',
  },
  context: {
    reason: 'Sending monthly invoice to client',
  },
  waitForApproval: true,
  onPendingApproval: (info) => {
    console.log(`Waiting for approval: ${info.approvalUrl}`);
  },
});

if (permission.status === 'approved') {
  // Use the token for your protected operation
  await sendEmail({
    to: 'client@example.com',
    subject: 'Invoice #123',
    otpToken: permission.token,
  });

  // Mark token as used
  await otp.useToken(permission.id, permission.token);
}
```

## How It Works

```
┌──────────────┐     1. Request Permission      ┌──────────────┐
│   AI Agent   │ ─────────────────────────────► │  Agent OTP   │
│   + SDK      │                                │     API      │
└──────────────┘                                └──────────────┘
       │                                               │
       │                                               │ 2. Evaluate
       │                                               │    Policy
       │                                               ▼
       │                                        ┌──────────────┐
       │                                        │   Policy     │
       │                                        │   Engine     │
       │                                        └──────────────┘
       │                                               │
       │                     3. Decision               │
       │ ◄─────────────────────────────────────────────┤
       │   (auto_approve | require_approval | deny)    │
       │                                               │
       │         If require_approval:                  │
       │                                               ▼
       │                                        ┌──────────────┐
       │                                        │  Telegram    │
       │                                        │  / Web UI    │
       │                                        └──────────────┘
       │                                               │
       │                     4. User Decision          │
       │ ◄─────────────────────────────────────────────┤
       │                                               │
       │         5. Token                              │
       │ ◄─────────────────────────────────────────────┤
       │                                               │
       ▼                                               │
┌──────────────┐     6. Use Token              ┌──────────────┐
│  Protected   │ ─────────────────────────────►│    Audit     │
│  Operation   │                               │     Log      │
└──────────────┘                               └──────────────┘
```

## Documentation

Full documentation is available at [agentotp.com/docs](https://agentotp.com/docs).

- [Quick Start Guide](https://agentotp.com/docs/quickstart)
- [SDK Reference](https://agentotp.com/docs/sdk/typescript)
- [API Reference](https://agentotp.com/docs/api)
- [Policy Configuration](https://agentotp.com/docs/concepts/policies)
- [Integration Guides](https://agentotp.com/docs/integrations)

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
git clone https://github.com/yourusername/agent-otp.git
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

## Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please email security@agentotp.com. Do not open public issues for security vulnerabilities.

### Security Best Practices

- **Never commit secrets**: All sensitive configuration should be in `.env` files (which are gitignored)
- **Use environment variables**: API keys, database credentials, and JWT secrets should always be in environment variables
- **Rotate API keys**: Regularly rotate your Agent OTP API keys
- **Review policies**: Audit your permission policies regularly to ensure they follow least-privilege principles

## API Reference

### Permission Request

```http
POST /api/v1/permissions/request
Authorization: Bearer ak_your_api_key

{
  "action": "gmail.send",
  "resource": "email:recipient@example.com",
  "scope": {
    "max_emails": 1,
    "subject_pattern": "^Invoice.*"
  },
  "context": {
    "reason": "Sending monthly invoice"
  },
  "ttl": 300
}
```

### Token Verification

```http
POST /api/v1/permissions/:id/verify
Authorization: Bearer ak_your_api_key

{
  "token": "otp_xxxxxx"
}
```

### Token Usage

```http
POST /api/v1/permissions/:id/use
Authorization: Bearer ak_your_api_key

{
  "token": "otp_xxxxxx",
  "actionDetails": {
    "recipient": "client@example.com",
    "subject": "Invoice #123"
  }
}
```

## Policy Configuration

Policies define how permission requests are handled. Example policies:

```yaml
# Auto-approve small file reads
- name: "Auto-approve file reads"
  conditions:
    action: { equals: "file.read" }
    scope.size_limit: { lessThan: 1048576 }
  action: auto_approve
  scopeTemplate:
    max_size: 1048576
    allowed_extensions: [".txt", ".md", ".json"]

# Require approval for financial operations
- name: "Financial operations require approval"
  conditions:
    action: { startsWith: "bank." }
  action: require_approval
  priority: 100

# Auto-approve internal emails
- name: "Auto-approve internal emails"
  conditions:
    action: { equals: "gmail.send" }
    context.recipient: { matches: ".*@mycompany\\.com$" }
  action: auto_approve

# Default deny
- name: "Default deny"
  conditions: {}
  action: deny
  priority: -1000
```

## Roadmap

- [x] Core API with permission request/verify/use
- [x] TypeScript SDK
- [x] Policy engine with conditions
- [x] Documentation website
- [ ] Web Dashboard
- [ ] Telegram Bot for approvals
- [ ] Python SDK
- [ ] LangChain integration
- [ ] CrewAI integration
- [ ] Enterprise features (SSO, advanced audit)

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

- 📚 [Documentation](https://agentotp.com/docs)
- 💬 [Discord Community](https://discord.gg/agentotp)
- 🐛 [GitHub Issues](https://github.com/yourusername/agent-otp/issues)
- 📧 [Email Support](mailto:support@agentotp.com)
