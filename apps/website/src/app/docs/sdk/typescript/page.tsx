import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TypeScript SDK',
  description: 'Complete reference for the Agent OTP TypeScript SDK. Learn about the client API, encryption utilities, and error handling.',
};

export default function TypeScriptSDKPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>TypeScript SDK Reference</h1>

      <p className="lead text-xl text-muted-foreground">
        The official TypeScript SDK for Agent OTP. Full type safety, end-to-end
        encryption support, and comprehensive error handling.
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

const client = new AgentOTPClient(config: AgentOTPClientConfig);`}</code>
      </pre>

      <h4>Config Options</h4>

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
              <td className="py-2 px-4">API base URL (default: https://api.agentotp.com)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">timeout</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Request timeout in ms (default: 30000)</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">retryAttempts</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Number of retry attempts (default: 3)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>requestOTP()</h3>

      <p>Request an OTP from the relay service.</p>

      <pre className="language-typescript">
        <code>{`const request = await client.requestOTP(
  options: RequestOTPOptions
): Promise<OTPRequestResult>;`}</code>
      </pre>

      <h4>RequestOTPOptions</h4>

      <pre className="language-typescript">
        <code>{`interface RequestOTPOptions {
  // Why the agent needs this OTP (shown to user)
  reason: string;

  // Expected sender name (e.g., "Google", "GitHub")
  expectedSender?: string;

  // Filter criteria for matching OTPs
  filter?: OTPSourceFilter;

  // Agent's public key for E2E encryption (base64)
  publicKey: string;

  // Request TTL in seconds (default: 300)
  ttl?: number;

  // Block until OTP arrives (default: false)
  waitForOTP?: boolean;

  // Wait timeout in ms (default: 120000)
  timeout?: number;

  // Callback when pending user approval
  onPendingApproval?: (info: PendingApprovalInfo) => void;
}

interface OTPSourceFilter {
  // OTP sources to accept: 'sms', 'email', 'whatsapp'
  sources?: OTPSource[];

  // Sender pattern with wildcards (e.g., '*@google.com')
  senderPattern?: string;

  // Content pattern to match in message
  contentPattern?: string;
}`}</code>
      </pre>

      <h4>OTPRequestResult</h4>

      <pre className="language-typescript">
        <code>{`interface OTPRequestResult {
  // Unique request ID
  id: string;

  // Current status
  status: OTPRequestStatus;

  // URL for user to approve (if pending)
  approvalUrl?: string;

  // WebSocket URL for real-time updates
  webhookUrl?: string;

  // When the request expires
  expiresAt: string;

  // Denial reason (if denied)
  reason?: string;
}

type OTPRequestStatus =
  | 'pending_approval'  // Waiting for user approval
  | 'approved'          // Approved, waiting for OTP
  | 'otp_received'      // OTP ready to consume
  | 'consumed'          // OTP has been read
  | 'denied'            // User denied access
  | 'expired'           // Request expired
  | 'cancelled';        // Request was cancelled`}</code>
      </pre>

      <h4>Example</h4>

      <pre className="language-typescript">
        <code>{`const request = await client.requestOTP({
  reason: 'Sign up verification for Acme Inc',
  expectedSender: 'Acme',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
  publicKey: await exportPublicKey(publicKey),
  ttl: 300,
  waitForOTP: true,
  timeout: 120000,
  onPendingApproval: (info) => {
    console.log(\`Please approve at: \${info.approvalUrl}\`);
  },
});

if (request.status === 'otp_received') {
  const { code } = await client.consumeOTP(request.id, privateKey);
  console.log('OTP code:', code);
}`}</code>
      </pre>

      <h3>getOTPStatus()</h3>

      <p>Check the current status of an OTP request.</p>

      <pre className="language-typescript">
        <code>{`const status = await client.getOTPStatus(
  requestId: string
): Promise<OTPRequestResult>;

// Example
const status = await client.getOTPStatus('otp_abc123');
console.log(status.status); // 'pending_approval' | 'approved' | 'otp_received' | ...`}</code>
      </pre>

      <h3>consumeOTP()</h3>

      <p>Consume and decrypt the OTP. This is a one-time operation - the OTP is deleted after reading.</p>

      <pre className="language-typescript">
        <code>{`const result = await client.consumeOTP(
  requestId: string,
  privateKey: CryptoKey
): Promise<OTPConsumeResult>;

interface OTPConsumeResult {
  // The decrypted OTP code
  code: string;

  // Full message content (optional)
  fullMessage?: string;

  // Metadata about the OTP
  metadata?: OTPMetadata;
}

interface OTPMetadata {
  source: 'sms' | 'email' | 'whatsapp';
  sender?: string;
  subject?: string;
  receivedAt: string;
}`}</code>
      </pre>

      <h4>Example</h4>

      <pre className="language-typescript">
        <code>{`// Load your private key
const privateKey = await importPrivateKey(process.env.AGENT_PRIVATE_KEY!);

// Consume the OTP
const { code, metadata } = await client.consumeOTP('otp_abc123', privateKey);

console.log('Code:', code);           // e.g., "123456"
console.log('From:', metadata?.sender); // e.g., "noreply@acme.com"
console.log('Source:', metadata?.source); // e.g., "email"`}</code>
      </pre>

      <h3>cancelOTPRequest()</h3>

      <p>Cancel a pending OTP request.</p>

      <pre className="language-typescript">
        <code>{`await client.cancelOTPRequest(requestId: string): Promise<void>;

// Example
await client.cancelOTPRequest('otp_abc123');`}</code>
      </pre>

      <h2>Encryption Utilities</h2>

      <p>
        The SDK provides utilities for generating and managing encryption keys
        used for end-to-end encryption.
      </p>

      <h3>generateKeyPair()</h3>

      <p>Generate a new RSA key pair for E2E encryption.</p>

      <pre className="language-typescript">
        <code>{`import { generateKeyPair } from '@orrisai/agent-otp-sdk';

const { publicKey, privateKey } = await generateKeyPair();
// publicKey: CryptoKey (for encrypting)
// privateKey: CryptoKey (for decrypting)`}</code>
      </pre>

      <h3>exportPublicKey() / exportPrivateKey()</h3>

      <p>Export keys to base64 strings for storage or transmission.</p>

      <pre className="language-typescript">
        <code>{`import {
  exportPublicKey,
  exportPrivateKey,
} from '@orrisai/agent-otp-sdk';

// Export to base64 strings
const publicKeyBase64 = await exportPublicKey(publicKey);
const privateKeyBase64 = await exportPrivateKey(privateKey);

// Store these securely
// publicKeyBase64 can be shared
// privateKeyBase64 must be kept secret`}</code>
      </pre>

      <h3>importPrivateKey()</h3>

      <p>Import a previously exported private key.</p>

      <pre className="language-typescript">
        <code>{`import { importPrivateKey } from '@orrisai/agent-otp-sdk';

// Load from environment variable or secrets manager
const privateKey = await importPrivateKey(process.env.AGENT_PRIVATE_KEY!);

// Use for consuming OTPs
const { code } = await client.consumeOTP(requestId, privateKey);`}</code>
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
  TimeoutError,
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
  } else if (error instanceof OTPAlreadyConsumedError) {
    console.log('OTP already used at:', error.consumedAt);
  } else if (error instanceof DecryptionError) {
    console.log('Failed to decrypt - wrong private key?');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.log('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof AgentOTPError) {
    console.log('API error:', error.code, error.message);
  }
}`}</code>
      </pre>

      <h3>Error Types</h3>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Error</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">AuthenticationError</td>
              <td className="py-2 px-4">Invalid or missing API key</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">ValidationError</td>
              <td className="py-2 px-4">Invalid request parameters</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">RateLimitError</td>
              <td className="py-2 px-4">Rate limit exceeded (has retryAfter)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">TimeoutError</td>
              <td className="py-2 px-4">Request timed out</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">NetworkError</td>
              <td className="py-2 px-4">Network connectivity issue</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTPNotFoundError</td>
              <td className="py-2 px-4">No matching OTP request found</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTPExpiredError</td>
              <td className="py-2 px-4">OTP request has expired (has expiredAt)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTPAlreadyConsumedError</td>
              <td className="py-2 px-4">OTP already read (has consumedAt)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">OTPApprovalDeniedError</td>
              <td className="py-2 px-4">User denied OTP access (has reason)</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">DecryptionError</td>
              <td className="py-2 px-4">Failed to decrypt OTP payload</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Types</h2>

      <p>All types are exported from the package:</p>

      <pre className="language-typescript">
        <code>{`import type {
  // Client config
  AgentOTPClientConfig,

  // OTP types
  OTPSource,
  OTPRequestStatus,
  OTPSourceFilter,
  OTPMetadata,
  OTPConsumeResult,

  // Request/Response
  RequestOTPOptions,
  OTPRequestResult,
  PendingApprovalInfo,
} from '@orrisai/agent-otp-sdk';`}</code>
      </pre>

      <h2>Best Practices</h2>

      <ul>
        <li>
          <strong>Store private keys securely</strong> - Use environment variables
          or a secrets manager, never commit to source control
        </li>
        <li>
          <strong>Generate keys once</strong> - Reuse the same key pair for your
          agent; only regenerate if compromised
        </li>
        <li>
          <strong>Provide clear reasons</strong> - Help users make informed
          approval decisions with descriptive reasons
        </li>
        <li>
          <strong>Use filters</strong> - Narrow down expected senders to avoid
          capturing unrelated OTPs
        </li>
        <li>
          <strong>Handle all statuses</strong> - Always handle denied, expired,
          and error cases gracefully
        </li>
        <li>
          <strong>Consume promptly</strong> - Once an OTP is received, consume it
          quickly as requests have TTLs
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
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            Encryption Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/errors" className="text-primary hover:underline">
            Error Handling Guide
          </Link>
        </li>
      </ul>
    </article>
  );
}
