import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TypeScript SDK',
  description: 'Complete reference for the Agent OTP TypeScript SDK. Learn about the client API, types, and configuration options.',
};

export default function TypeScriptSDKPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>TypeScript SDK Reference</h1>

      <p className="lead text-xl text-muted-foreground">
        The official TypeScript SDK for Agent OTP. Full type safety, async/await
        support, and comprehensive error handling.
      </p>

      <h2>Installation</h2>

      <pre className="language-bash">
        <code>npm install @orrisai/agent-otp-sdk</code>
      </pre>

      <h2>AgentOTPClient</h2>

      <p>The main client class for interacting with the Agent OTP API.</p>

      <h3>Constructor</h3>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient(options: AgentOTPClientOptions);`}</code>
      </pre>

      <h4>Options</h4>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Property</th>
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Required</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">apiKey</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">string</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Your Agent OTP API key</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">baseUrl</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">string</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">API base URL (for self-hosted)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">timeout</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Default request timeout in ms (30000)</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">retries</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Number of retry attempts (3)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>requestPermission()</h3>

      <p>Request a new permission for a sensitive operation.</p>

      <pre className="language-typescript">
        <code>{`const permission = await client.requestPermission(
  request: PermissionRequest
): Promise<PermissionResponse>;`}</code>
      </pre>

      <h4>PermissionRequest</h4>

      <pre className="language-typescript">
        <code>{`interface PermissionRequest {
  // The action being requested (e.g., 'email.send', 'file.read')
  action: string;

  // The specific resource being accessed (optional)
  resource?: string;

  // Scope constraints for the permission
  scope: Record<string, unknown>;

  // Additional context about the request
  context?: Record<string, unknown>;

  // Time-to-live in seconds (default: 300, max: 3600)
  ttl?: number;

  // Whether to block until the request is approved/denied
  waitForApproval?: boolean;

  // Timeout for waiting (in ms, default: 60000)
  timeout?: number;

  // Callback when approval is pending
  onPendingApproval?: (info: PendingApprovalInfo) => void;
}`}</code>
      </pre>

      <h4>PermissionResponse</h4>

      <pre className="language-typescript">
        <code>{`interface PermissionResponse {
  // Unique permission ID
  id: string;

  // Status: 'approved', 'denied', 'pending', 'expired'
  status: PermissionStatus;

  // The one-time token (only present when approved)
  token?: string;

  // Granted scope (may be more restrictive than requested)
  scope?: Record<string, unknown>;

  // Expiration timestamp
  expiresAt: string;

  // Reason for denial (if denied)
  reason?: string;

  // URL for manual approval (if pending)
  approvalUrl?: string;
}`}</code>
      </pre>

      <h4>Example</h4>

      <pre className="language-typescript">
        <code>{`const permission = await client.requestPermission({
  action: 'email.send',
  resource: 'email:client@example.com',
  scope: {
    max_emails: 1,
    subject_pattern: '^Invoice.*',
  },
  context: {
    reason: 'Sending monthly invoice',
    triggeredBy: 'scheduled_task',
  },
  ttl: 300,
  waitForApproval: true,
  timeout: 60000,
  onPendingApproval: (info) => {
    console.log(\`Approval needed: \${info.approvalUrl}\`);
  },
});

if (permission.status === 'approved') {
  console.log('Token:', permission.token);
}`}</code>
      </pre>

      <h3>verifyToken()</h3>

      <p>Verify that a token is still valid without consuming it.</p>

      <pre className="language-typescript">
        <code>{`const result = await client.verifyToken(
  permissionId: string,
  token: string
): Promise<TokenVerification>;

interface TokenVerification {
  valid: boolean;
  scope?: Record<string, unknown>;
  usesRemaining?: number;
  expiresAt?: string;
}`}</code>
      </pre>

      <h3>useToken()</h3>

      <p>Mark a token as used after performing the operation.</p>

      <pre className="language-typescript">
        <code>{`const result = await client.useToken(
  permissionId: string,
  token: string,
  details?: Record<string, unknown>
): Promise<TokenUsageResult>;

interface TokenUsageResult {
  success: boolean;
  usesRemaining: number;
}`}</code>
      </pre>

      <h3>revokeToken()</h3>

      <p>Revoke a token before it expires or is used.</p>

      <pre className="language-typescript">
        <code>{`await client.revokeToken(
  permissionId: string,
  token: string
): Promise<void>;`}</code>
      </pre>

      <h2>Error Handling</h2>

      <p>The SDK throws typed errors for different failure scenarios:</p>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  NetworkError,
} from '@orrisai/agent-otp-sdk';

try {
  const permission = await client.requestPermission({...});
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Invalid or expired API key
    console.error('Auth failed:', error.message);
  } else if (error instanceof ValidationError) {
    // Invalid request parameters
    console.error('Validation failed:', error.details);
  } else if (error instanceof RateLimitError) {
    // Rate limit exceeded
    console.error('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    // Network connectivity issue
    console.error('Network error:', error.message);
  } else if (error instanceof AgentOTPError) {
    // Other API error
    console.error('API error:', error.code, error.message);
  }
}`}</code>
      </pre>

      <h2>Types</h2>

      <p>
        All types are exported from the package for use in your application:
      </p>

      <pre className="language-typescript">
        <code>{`import type {
  AgentOTPClientOptions,
  PermissionRequest,
  PermissionResponse,
  PermissionStatus,
  TokenVerification,
  TokenUsageResult,
  PendingApprovalInfo,
  Policy,
  PolicyCondition,
  Agent,
} from '@orrisai/agent-otp-sdk';`}</code>
      </pre>

      <h2>Best Practices</h2>

      <ul>
        <li>
          <strong>Store API keys securely</strong> - Use environment variables,
          never commit API keys to source control
        </li>
        <li>
          <strong>Use descriptive context</strong> - Provide clear reasons for
          permission requests to help with approval decisions
        </li>
        <li>
          <strong>Handle all statuses</strong> - Always handle approved, denied,
          pending, and expired statuses
        </li>
        <li>
          <strong>Set appropriate timeouts</strong> - Balance between giving
          humans time to approve and not blocking too long
        </li>
        <li>
          <strong>Use tokens immediately</strong> - Tokens are ephemeral; use
          them right after receiving approval
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Quick Start Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/errors" className="text-primary hover:underline">
            Error Handling Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/api/permissions" className="text-primary hover:underline">
            Permissions API Reference
          </Link>
        </li>
      </ul>
    </article>
  );
}
