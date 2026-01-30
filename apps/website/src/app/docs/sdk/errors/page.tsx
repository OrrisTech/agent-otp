import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Error Handling',
  description: 'Handle errors gracefully in Agent OTP. Learn about error types, codes, and best practices for error handling.',
};

export default function ErrorsPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Error Handling</h1>

      <p className="lead text-xl text-muted-foreground">
        Learn how to handle errors gracefully when using the Agent OTP SDK.
        All errors are typed and provide detailed information for debugging.
      </p>

      <h2>Error Hierarchy</h2>

      <p>
        All SDK errors inherit from <code>AgentOTPError</code>:
      </p>

      <pre className="language-text">
        <code>{`AgentOTPError
├── AuthenticationError
├── ValidationError
├── RateLimitError
├── NetworkError
├── PermissionDeniedError
├── TokenError
│   ├── TokenExpiredError
│   ├── TokenRevokedError
│   └── TokenUsedError
└── ServerError`}</code>
      </pre>

      <h2>Error Types</h2>

      <h3>AgentOTPError</h3>

      <p>Base class for all SDK errors.</p>

      <pre className="language-typescript">
        <code>{`interface AgentOTPError extends Error {
  code: string;      // Error code (e.g., 'AUTH_FAILED')
  message: string;   // Human-readable message
  status?: number;   // HTTP status code (if applicable)
  details?: unknown; // Additional error details
}`}</code>
      </pre>

      <h3>AuthenticationError</h3>

      <p>Thrown when authentication fails.</p>

      <pre className="language-typescript">
        <code>{`import { AuthenticationError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestPermission({...});
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Error codes:
    // - 'INVALID_API_KEY': API key is malformed
    // - 'EXPIRED_API_KEY': API key has been revoked or expired
    // - 'MISSING_API_KEY': No API key provided
    console.log('Auth failed:', error.code);
  }
}`}</code>
      </pre>

      <h3>ValidationError</h3>

      <p>Thrown when request validation fails.</p>

      <pre className="language-typescript">
        <code>{`import { ValidationError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestPermission({
    action: '', // Invalid: empty string
    scope: { max_size: -1 }, // Invalid: negative
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation errors:', error.details);
    // {
    //   action: 'action is required',
    //   'scope.max_size': 'must be a positive integer'
    // }
  }
}`}</code>
      </pre>

      <h3>RateLimitError</h3>

      <p>Thrown when rate limits are exceeded.</p>

      <pre className="language-typescript">
        <code>{`import { RateLimitError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestPermission({...});
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited');
    console.log('Retry after:', error.retryAfter, 'seconds');
    console.log('Limit:', error.limit);
    console.log('Remaining:', error.remaining);

    // Wait and retry
    await sleep(error.retryAfter * 1000);
    await client.requestPermission({...});
  }
}`}</code>
      </pre>

      <h3>NetworkError</h3>

      <p>Thrown when network connectivity fails.</p>

      <pre className="language-typescript">
        <code>{`import { NetworkError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestPermission({...});
} catch (error) {
  if (error instanceof NetworkError) {
    // Error codes:
    // - 'TIMEOUT': Request timed out
    // - 'CONNECTION_REFUSED': Could not connect to server
    // - 'DNS_ERROR': DNS resolution failed
    console.log('Network error:', error.code);
  }
}`}</code>
      </pre>

      <h3>PermissionDeniedError</h3>

      <p>Thrown when a permission request is denied by policy or user.</p>

      <pre className="language-typescript">
        <code>{`import { PermissionDeniedError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestPermission({
    action: 'bank.transfer',
    waitForApproval: true,
  });
} catch (error) {
  if (error instanceof PermissionDeniedError) {
    console.log('Permission denied');
    console.log('Reason:', error.reason);
    console.log('Denied by:', error.deniedBy); // 'policy' or 'user'
  }
}`}</code>
      </pre>

      <h3>Token Errors</h3>

      <p>Errors related to token operations:</p>

      <pre className="language-typescript">
        <code>{`import {
  TokenExpiredError,
  TokenRevokedError,
  TokenUsedError,
} from '@orrisai/agent-otp-sdk';

try {
  await client.useToken(permissionId, token);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    console.log('Token expired at:', error.expiredAt);
    // Request a new permission
  } else if (error instanceof TokenRevokedError) {
    console.log('Token was revoked at:', error.revokedAt);
    console.log('Revoked by:', error.revokedBy);
  } else if (error instanceof TokenUsedError) {
    console.log('Token already used at:', error.usedAt);
  }
}`}</code>
      </pre>

      <h3>ServerError</h3>

      <p>Thrown when the server returns a 5xx error.</p>

      <pre className="language-typescript">
        <code>{`import { ServerError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestPermission({...});
} catch (error) {
  if (error instanceof ServerError) {
    console.log('Server error:', error.status);
    console.log('Request ID:', error.requestId);
    // Report to support with requestId
  }
}`}</code>
      </pre>

      <h2>Error Codes Reference</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Code</th>
              <th className="py-2 px-4 text-left font-semibold">HTTP</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">INVALID_API_KEY</td>
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4">API key is invalid or malformed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">EXPIRED_API_KEY</td>
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4">API key has expired or been revoked</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">VALIDATION_ERROR</td>
              <td className="py-2 px-4">400</td>
              <td className="py-2 px-4">Request validation failed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">RATE_LIMITED</td>
              <td className="py-2 px-4">429</td>
              <td className="py-2 px-4">Rate limit exceeded</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">PERMISSION_DENIED</td>
              <td className="py-2 px-4">403</td>
              <td className="py-2 px-4">Permission request was denied</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">TOKEN_EXPIRED</td>
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4">Token has expired</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">TOKEN_REVOKED</td>
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4">Token was revoked</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">TOKEN_USED</td>
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4">Token has already been used</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">NOT_FOUND</td>
              <td className="py-2 px-4">404</td>
              <td className="py-2 px-4">Resource not found</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">SERVER_ERROR</td>
              <td className="py-2 px-4">500</td>
              <td className="py-2 px-4">Internal server error</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Best Practices</h2>

      <h3>1. Always Catch Specific Errors</h3>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
  PermissionDeniedError,
} from '@orrisai/agent-otp-sdk';

async function requestWithErrorHandling() {
  try {
    return await client.requestPermission({...});
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Handle auth errors (check API key)
      throw new Error('Configuration error: invalid API key');
    }
    if (error instanceof ValidationError) {
      // Handle validation errors (fix request)
      throw new Error(\`Invalid request: \${JSON.stringify(error.details)}\`);
    }
    if (error instanceof RateLimitError) {
      // Handle rate limits (wait and retry)
      await sleep(error.retryAfter * 1000);
      return requestWithErrorHandling();
    }
    if (error instanceof NetworkError) {
      // Handle network errors (retry with backoff)
      throw new Error('Network error, please try again');
    }
    if (error instanceof PermissionDeniedError) {
      // Handle denials (inform user)
      throw new Error(\`Permission denied: \${error.reason}\`);
    }
    // Re-throw unknown errors
    throw error;
  }
}`}</code>
      </pre>

      <h3>2. Implement Retry Logic</h3>

      <pre className="language-typescript">
        <code>{`async function requestWithRetry(
  request: PermissionRequest,
  maxRetries = 3,
): Promise<PermissionResponse> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.requestPermission(request);
    } catch (error) {
      lastError = error;

      if (error instanceof RateLimitError) {
        await sleep(error.retryAfter * 1000);
        continue;
      }

      if (error instanceof NetworkError) {
        // Exponential backoff
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }

      // Don't retry other errors
      throw error;
    }
  }

  throw lastError;
}`}</code>
      </pre>

      <h3>3. Log Errors with Context</h3>

      <pre className="language-typescript">
        <code>{`try {
  await client.requestPermission({...});
} catch (error) {
  if (error instanceof AgentOTPError) {
    console.error('Agent OTP Error', {
      code: error.code,
      message: error.message,
      status: error.status,
      // Don't log sensitive details like tokens
    });
  }
  throw error;
}`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            TypeScript SDK Reference
          </Link>
        </li>
        <li>
          <Link href="/docs/api/permissions" className="text-primary hover:underline">
            Permissions API
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/security" className="text-primary hover:underline">
            Security Best Practices
          </Link>
        </li>
      </ul>
    </article>
  );
}
