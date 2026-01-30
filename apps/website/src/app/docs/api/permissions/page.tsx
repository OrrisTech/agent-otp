import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'OTP API - API Reference',
  description: 'Complete API reference for requesting, checking, and consuming OTPs in Agent OTP.',
};

export default function OTPAPIPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>OTP API</h1>

      <p className="lead text-xl text-muted-foreground">
        The OTP API allows you to request, check status, and consume one-time
        verification codes securely.
      </p>

      <h2>Endpoints</h2>

      <ul>
        <li>
          <code>POST /v1/otp/request</code> - Request a new OTP
        </li>
        <li>
          <code>GET /v1/otp/:id</code> - Get OTP request status
        </li>
        <li>
          <code>POST /v1/otp/:id/consume</code> - Consume the OTP
        </li>
        <li>
          <code>DELETE /v1/otp/:id</code> - Cancel the request
        </li>
      </ul>

      <h2>Request OTP</h2>

      <p>Request a new OTP for verification purposes.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/otp/request
Content-Type: application/json
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h4>Body Parameters</h4>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Field</th>
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Required</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">reason</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Why the agent needs this OTP</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">publicKey</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Agent&apos;s RSA public key for E2E encryption</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">expectedSender</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Hint for expected sender (e.g., &quot;Google&quot;, &quot;GitHub&quot;)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">filter</td>
              <td className="py-2 px-4">object</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Source and sender filters</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">ttl</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Request TTL in seconds (default: 300, max: 3600)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Filter Object</h4>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Field</th>
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">sources</td>
              <td className="py-2 px-4">string[]</td>
              <td className="py-2 px-4">OTP sources: &quot;sms&quot;, &quot;email&quot;, &quot;whatsapp&quot;</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">senderPattern</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Glob pattern for sender (e.g., &quot;*@acme.com&quot;)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>

      <pre className="language-json">
        <code>{`{
  "reason": "Sign up verification for Acme Inc",
  "publicKey": "MIIBIjANBgkqhkiG9w...",
  "expectedSender": "Acme",
  "filter": {
    "sources": ["email"],
    "senderPattern": "*@acme.com"
  },
  "ttl": 300
}`}</code>
      </pre>

      <h3>Response</h3>

      <h4>Pending Approval (202 Accepted)</h4>

      <pre className="language-json">
        <code>{`{
  "id": "otp_xxxxxxxxxxxx",
  "status": "pending_approval",
  "reason": "Sign up verification for Acme Inc",
  "expiresAt": "2026-01-28T12:05:00Z",
  "createdAt": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <h4>Approved (200 OK)</h4>

      <pre className="language-json">
        <code>{`{
  "id": "otp_xxxxxxxxxxxx",
  "status": "approved",
  "reason": "Sign up verification for Acme Inc",
  "expiresAt": "2026-01-28T12:05:00Z",
  "createdAt": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <h4>Denied (403 Forbidden)</h4>

      <pre className="language-json">
        <code>{`{
  "id": "otp_xxxxxxxxxxxx",
  "status": "denied",
  "reason": "User denied the request"
}`}</code>
      </pre>

      <h2>Get OTP Status</h2>

      <p>Check the current status of an OTP request.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`GET /v1/otp/:id
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "id": "otp_xxxxxxxxxxxx",
  "status": "otp_received",
  "reason": "Sign up verification for Acme Inc",
  "source": "email",
  "sender": "noreply@acme.com",
  "expiresAt": "2026-01-28T12:05:00Z",
  "createdAt": "2026-01-28T12:00:00Z",
  "receivedAt": "2026-01-28T12:01:30Z"
}`}</code>
      </pre>

      <h3>Status Values</h3>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Status</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">pending_approval</td>
              <td className="py-2 px-4">Waiting for user to approve the request</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">approved</td>
              <td className="py-2 px-4">User approved, waiting for OTP to arrive</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">otp_received</td>
              <td className="py-2 px-4">OTP captured and ready to consume</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">consumed</td>
              <td className="py-2 px-4">OTP has been read and deleted</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">denied</td>
              <td className="py-2 px-4">User denied the request</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">expired</td>
              <td className="py-2 px-4">Request expired before completion</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">cancelled</td>
              <td className="py-2 px-4">Request was cancelled by the agent</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Consume OTP</h2>

      <p>Retrieve and delete the OTP. This is a one-time operation.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/otp/:id/consume
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "id": "otp_xxxxxxxxxxxx",
  "encryptedPayload": "base64-encoded-encrypted-otp...",
  "source": "email",
  "sender": "noreply@acme.com",
  "consumedAt": "2026-01-28T12:02:00Z"
}`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Important:</strong> The <code>encryptedPayload</code> must be
          decrypted using your agent&apos;s private key. Use the SDK&apos;s{' '}
          <code>decryptOTPPayload()</code> function for this.
        </p>
      </div>

      <h2>Cancel OTP Request</h2>

      <p>Cancel a pending OTP request.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`DELETE /v1/otp/:id
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "success": true,
  "id": "otp_xxxxxxxxxxxx",
  "cancelledAt": "2026-01-28T12:02:00Z"
}`}</code>
      </pre>

      <h2>WebSocket Updates</h2>

      <p>
        Connect to the WebSocket URL for real-time status updates:
      </p>

      <pre className="language-typescript">
        <code>{`const ws = new WebSocket('wss://api.agentotp.com/ws/otp_xxxx');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'status_change':
      console.log('Status:', data.status);
      if (data.status === 'otp_received') {
        console.log('OTP is ready to consume!');
      }
      break;
    case 'expired':
      console.log('OTP request expired');
      break;
  }
};`}</code>
      </pre>

      <h2>Error Responses</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Status</th>
              <th className="py-2 px-4 text-left font-semibold">Code</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">400</td>
              <td className="py-2 px-4 font-mono">VALIDATION_ERROR</td>
              <td className="py-2 px-4">Invalid request parameters</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4 font-mono">UNAUTHORIZED</td>
              <td className="py-2 px-4">Invalid or missing API key</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">404</td>
              <td className="py-2 px-4 font-mono">NOT_FOUND</td>
              <td className="py-2 px-4">OTP request not found</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">409</td>
              <td className="py-2 px-4 font-mono">ALREADY_CONSUMED</td>
              <td className="py-2 px-4">OTP has already been consumed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4 font-mono">EXPIRED</td>
              <td className="py-2 px-4">OTP request has expired</td>
            </tr>
            <tr>
              <td className="py-2 px-4">429</td>
              <td className="py-2 px-4 font-mono">RATE_LIMITED</td>
              <td className="py-2 px-4">Rate limit exceeded</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/how-it-works" className="text-primary hover:underline">
            How It Works
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            End-to-End Encryption
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            TypeScript SDK Reference
          </Link>
        </li>
      </ul>
    </article>
  );
}
