# @orrisai/agent-otp-shared

Shared types, schemas, and constants for [Agent OTP](https://agentotp.com).

This package contains:
- TypeScript type definitions
- Zod validation schemas
- Shared constants

## Installation

```bash
npm install @orrisai/agent-otp-shared
```

## Usage

```typescript
// Import types
import type {
  PermissionStatus,
  TokenVerificationResult,
  TokenUsageResult,
} from '@orrisai/agent-otp-shared';

// Import constants
import {
  PERMISSION_STATUS,
  POLICY_ACTION,
  TOKEN_DEFAULTS,
} from '@orrisai/agent-otp-shared';

// Import schemas for validation
import {
  createPermissionRequestSchema,
  verifyTokenSchema,
} from '@orrisai/agent-otp-shared';
```

## Exports

### Constants

- `PERMISSION_STATUS` - Permission status values (pending, approved, denied, expired, used)
- `POLICY_ACTION` - Policy action types (auto_approve, require_approval, deny)
- `TOKEN_DEFAULTS` - Default token configuration

### Types

- `PermissionStatus` - Permission status type
- `TokenVerificationResult` - Token verification response
- `TokenUsageResult` - Token usage response
- And more...

### Schemas (Zod)

- `createPermissionRequestSchema` - Validate permission requests
- `verifyTokenSchema` - Validate token verification
- `useTokenSchema` - Validate token usage
- And more...

## License

MIT - see [LICENSE](../../LICENSE) for details.
