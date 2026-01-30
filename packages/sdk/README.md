# @orrisai/agent-otp-sdk

TypeScript SDK for [Agent OTP](https://agentotp.com) - One-Time Permission service for AI Agents.

## Installation

```bash
npm install @orrisai/agent-otp-sdk
# or
bun add @orrisai/agent-otp-sdk
# or
pnpm add @orrisai/agent-otp-sdk
```

## Quick Start

```typescript
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

// Initialize the client (pointing to your self-hosted instance)
const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
  baseUrl: process.env.AGENT_OTP_URL || 'http://localhost:3000',
});

// Request permission for an action
const permission = await client.requestPermission({
  action: 'gmail.send',
  resource: 'email:recipient@example.com',
  scope: { max_emails: 1 },
  context: { reason: 'Sending invoice' },
  waitForApproval: true,
});

if (permission.status === 'approved') {
  // Use the token for your operation
  const result = await sendEmail({
    to: 'recipient@example.com',
    otpToken: permission.token,
  });

  // Mark token as used
  await client.useToken(permission.id, permission.token);
}
```

## Configuration

```typescript
const client = new AgentOTPClient({
  // Required: Your API key
  apiKey: 'ak_live_xxxx',

  // Required for self-hosted: Your Agent OTP server URL
  baseUrl: 'http://localhost:3000',

  // Optional: Request timeout in ms (default: 30000)
  timeout: 30000,

  // Optional: Number of retry attempts (default: 3)
  retryAttempts: 3,

  // Optional: Delay between retries in ms (default: 1000)
  retryDelay: 1000,
});
```

## API Reference

### `requestPermission(options)`

Request permission for a sensitive operation.

```typescript
const permission = await client.requestPermission({
  action: 'gmail.send',           // Required: action type
  resource: 'email:user@ex.com',  // Optional: specific resource
  scope: { max_emails: 1 },       // Optional: scope constraints
  context: { reason: '...' },     // Optional: context for approval
  ttl: 300,                       // Optional: token TTL in seconds
  waitForApproval: true,          // Optional: wait for human approval
  timeout: 60000,                 // Optional: approval timeout in ms
  onPendingApproval: (info) => {  // Optional: callback when pending
    console.log('Approve at:', info.approvalUrl);
  },
});
```

### `verifyToken(permissionId, token)`

Verify a token is still valid without consuming it.

```typescript
const result = await client.verifyToken(permissionId, token);
if (result.valid) {
  console.log(`Uses remaining: ${result.usesRemaining}`);
}
```

### `useToken(permissionId, token, options?)`

Mark a token as used.

```typescript
const result = await client.useToken(permissionId, token, {
  actionDetails: {
    recipient: 'user@example.com',
    subject: 'Invoice #123',
  },
});
```

### `executeWithPermission(options, operation)`

Helper that requests permission and automatically marks the token as used.

```typescript
const result = await client.executeWithPermission(
  {
    action: 'gmail.send',
    scope: { max_emails: 1 },
    waitForApproval: true,
  },
  async (token, scope) => {
    return await sendEmail({ to: 'user@example.com', token });
  }
);
```

## Error Handling

```typescript
import {
  AgentOTPError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  PermissionDeniedError,
  TimeoutError,
  NetworkError,
  ServerError,
} from '@orrisai/agent-otp-sdk';

try {
  const permission = await client.requestPermission({...});
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof PermissionDeniedError) {
    console.log('Permission denied:', error.reason);
  } else if (error instanceof TimeoutError) {
    console.log('Approval timed out');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof ServerError) {
    console.log('Server error:', error.status);
  }
}
```

## Self-Hosting

This SDK is designed to work with self-hosted Agent OTP instances. See the [Self-Hosting Guide](https://agentotp.com/docs/guides/self-hosting) for deployment instructions.

```bash
# Clone and start Agent OTP
git clone https://github.com/orristech/agent-otp.git
cd agent-otp
docker compose up -d

# Generate an API key
docker compose exec api bun run cli agent:create --name "my-agent"
```

## Documentation

- [Quick Start](https://agentotp.com/docs/quickstart)
- [SDK Reference](https://agentotp.com/docs/sdk/typescript)
- [Error Handling](https://agentotp.com/docs/sdk/errors)
- [Self-Hosting Guide](https://agentotp.com/docs/guides/self-hosting)

## License

MIT - see [LICENSE](../../LICENSE) for details.
