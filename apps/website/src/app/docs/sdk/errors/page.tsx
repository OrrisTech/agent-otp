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
├── TimeoutError
├── NetworkError
├── ServerError
└── OTP Errors
    ├── OTPNotFoundError
    ├── OTPExpiredError
    ├── OTPAlreadyConsumedError
    ├── OTPApprovalDeniedError
    ├── OTPCancelledError
    └── DecryptionError`}</code>
      </pre>

      <h2>Base Error</h2>

      <h3>AgentOTPError</h3>

      <p>Base class for all SDK errors.</p>

      <pre className="language-typescript">
        <code>{`interface AgentOTPError extends Error {
  code: string;                    // Error code (e.g., 'OTP_EXPIRED')
  message: string;                 // Human-readable message
  details?: Record<string, unknown>; // Additional error details
}`}</code>
      </pre>

      <h2>Common Errors</h2>

      <h3>AuthenticationError</h3>

      <p>Thrown when authentication fails (invalid or missing API key).</p>

      <pre className="language-typescript">
        <code>{`import { AuthenticationError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({...});
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.log('Auth failed:', error.message);
    // Check your API key configuration
  }
}`}</code>
      </pre>

      <h3>ValidationError</h3>

      <p>Thrown when request validation fails.</p>

      <pre className="language-typescript">
        <code>{`import { ValidationError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({
    reason: '', // Invalid: empty string
    publicKey: 'invalid', // Invalid: malformed key
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
    console.log('Details:', error.details);
  }
}`}</code>
      </pre>

      <h3>RateLimitError</h3>

      <p>Thrown when rate limits are exceeded.</p>

      <pre className="language-typescript">
        <code>{`import { RateLimitError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({...});
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited');
    console.log('Retry after:', error.retryAfter, 'seconds');

    // Wait and retry
    await sleep(error.retryAfter! * 1000);
    await client.requestOTP({...});
  }
}`}</code>
      </pre>

      <h3>TimeoutError</h3>

      <p>Thrown when a request times out.</p>

      <pre className="language-typescript">
        <code>{`import { TimeoutError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({
    waitForOTP: true,
    timeout: 60000, // 60 seconds
  });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out');
    // The OTP may still arrive - check status later
  }
}`}</code>
      </pre>

      <h3>NetworkError</h3>

      <p>Thrown when network connectivity fails.</p>

      <pre className="language-typescript">
        <code>{`import { NetworkError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({...});
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
    // Retry with exponential backoff
  }
}`}</code>
      </pre>

      <h3>ServerError</h3>

      <p>Thrown when the server returns a 5xx error.</p>

      <pre className="language-typescript">
        <code>{`import { ServerError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({...});
} catch (error) {
  if (error instanceof ServerError) {
    console.log('Server error:', error.status);
    console.log('Request ID:', error.requestId);
    // Report to support with requestId
  }
}`}</code>
      </pre>

      <h2>OTP-Specific Errors</h2>

      <h3>OTPNotFoundError</h3>

      <p>Thrown when no matching OTP request is found.</p>

      <pre className="language-typescript">
        <code>{`import { OTPNotFoundError } from '@orrisai/agent-otp-sdk';

try {
  await client.getOTPStatus('otp_invalid_id');
} catch (error) {
  if (error instanceof OTPNotFoundError) {
    console.log('OTP request not found');
  }
}`}</code>
      </pre>

      <h3>OTPExpiredError</h3>

      <p>Thrown when an OTP request has expired.</p>

      <pre className="language-typescript">
        <code>{`import { OTPExpiredError } from '@orrisai/agent-otp-sdk';

try {
  await client.consumeOTP(requestId, privateKey);
} catch (error) {
  if (error instanceof OTPExpiredError) {
    console.log('Request expired at:', error.expiredAt);
    // Create a new OTP request
  }
}`}</code>
      </pre>

      <h3>OTPAlreadyConsumedError</h3>

      <p>Thrown when attempting to consume an OTP that has already been read.</p>

      <pre className="language-typescript">
        <code>{`import { OTPAlreadyConsumedError } from '@orrisai/agent-otp-sdk';

try {
  await client.consumeOTP(requestId, privateKey);
} catch (error) {
  if (error instanceof OTPAlreadyConsumedError) {
    console.log('OTP already consumed at:', error.consumedAt);
    // OTPs are one-time use - request a new one if needed
  }
}`}</code>
      </pre>

      <h3>OTPApprovalDeniedError</h3>

      <p>Thrown when a user denies an OTP request.</p>

      <pre className="language-typescript">
        <code>{`import { OTPApprovalDeniedError } from '@orrisai/agent-otp-sdk';

try {
  await client.requestOTP({
    reason: 'Sign up verification',
    waitForOTP: true,
  });
} catch (error) {
  if (error instanceof OTPApprovalDeniedError) {
    console.log('User denied the request');
    console.log('Reason:', error.reason);
  }
}`}</code>
      </pre>

      <h3>OTPCancelledError</h3>

      <p>Thrown when an OTP request was cancelled.</p>

      <pre className="language-typescript">
        <code>{`import { OTPCancelledError } from '@orrisai/agent-otp-sdk';

try {
  await client.getOTPStatus(requestId);
} catch (error) {
  if (error instanceof OTPCancelledError) {
    console.log('Request was cancelled');
  }
}`}</code>
      </pre>

      <h3>DecryptionError</h3>

      <p>Thrown when OTP decryption fails (usually wrong private key).</p>

      <pre className="language-typescript">
        <code>{`import { DecryptionError } from '@orrisai/agent-otp-sdk';

try {
  await client.consumeOTP(requestId, privateKey);
} catch (error) {
  if (error instanceof DecryptionError) {
    console.log('Failed to decrypt OTP');
    // Verify you are using the correct private key
    // for the public key used in the request
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
              <td className="py-2 px-4 font-mono">AUTHENTICATION_ERROR</td>
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4">Invalid or missing API key</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">VALIDATION_ERROR</td>
              <td className="py-2 px-4">422</td>
              <td className="py-2 px-4">Request validation failed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">RATE_LIMIT_ERROR</td>
              <td className="py-2 px-4">429</td>
              <td className="py-2 px-4">Rate limit exceeded</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">TIMEOUT_ERROR</td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">Request timed out</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">NETWORK_ERROR</td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">Network connectivity failed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">SERVER_ERROR</td>
              <td className="py-2 px-4">5xx</td>
              <td className="py-2 px-4">Server error</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTP_NOT_FOUND</td>
              <td className="py-2 px-4">404</td>
              <td className="py-2 px-4">OTP request not found</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTP_EXPIRED</td>
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4">OTP request has expired</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTP_ALREADY_CONSUMED</td>
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4">OTP already consumed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTP_APPROVAL_DENIED</td>
              <td className="py-2 px-4">403</td>
              <td className="py-2 px-4">User denied OTP access</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTP_CANCELLED</td>
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4">OTP request cancelled</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">DECRYPTION_ERROR</td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">Failed to decrypt OTP payload</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Best Practices</h2>

      <h3>1. Handle Specific Errors</h3>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPError,
  AuthenticationError,
  OTPApprovalDeniedError,
  OTPExpiredError,
  DecryptionError,
  RateLimitError,
} from '@orrisai/agent-otp-sdk';

async function getOTPCode(requestId: string, privateKey: CryptoKey) {
  try {
    return await client.consumeOTP(requestId, privateKey);
  } catch (error) {
    if (error instanceof OTPApprovalDeniedError) {
      return { error: 'User denied access', reason: error.reason };
    }
    if (error instanceof OTPExpiredError) {
      return { error: 'Request expired', expiredAt: error.expiredAt };
    }
    if (error instanceof DecryptionError) {
      throw new Error('Wrong private key - check your key configuration');
    }
    if (error instanceof AuthenticationError) {
      throw new Error('Invalid API key - check your configuration');
    }
    if (error instanceof RateLimitError) {
      // Wait and retry
      await sleep(error.retryAfter! * 1000);
      return getOTPCode(requestId, privateKey);
    }
    throw error;
  }
}`}</code>
      </pre>

      <h3>2. Implement Retry Logic</h3>

      <pre className="language-typescript">
        <code>{`async function requestOTPWithRetry(
  options: RequestOTPOptions,
  maxRetries = 3,
): Promise<OTPRequestResult> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.requestOTP(options);
    } catch (error) {
      lastError = error as Error;

      if (error instanceof RateLimitError) {
        await sleep(error.retryAfter! * 1000);
        continue;
      }

      if (error instanceof NetworkError || error instanceof TimeoutError) {
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
  await client.consumeOTP(requestId, privateKey);
} catch (error) {
  if (error instanceof AgentOTPError) {
    console.error('Agent OTP Error', {
      code: error.code,
      message: error.message,
      requestId, // Include context
      // Don't log sensitive data like private keys
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
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Quick Start Guide
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
