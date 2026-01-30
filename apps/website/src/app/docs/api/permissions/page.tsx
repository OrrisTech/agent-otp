import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Permissions API - API Reference',
  description: 'Complete API reference for requesting, verifying, and using permissions in Agent OTP.',
};

export default function PermissionsAPIPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Permissions API</h1>

      <p className="lead text-xl text-muted-foreground">
        The Permissions API allows you to request, verify, and use one-time
        permission tokens for sensitive operations.
      </p>

      <h2>Endpoints</h2>

      <ul>
        <li>
          <code>POST /v1/permissions/request</code> - Request a new permission
        </li>
        <li>
          <code>GET /v1/permissions/:id</code> - Get permission status
        </li>
        <li>
          <code>POST /v1/permissions/:id/verify</code> - Verify a token
        </li>
        <li>
          <code>POST /v1/permissions/:id/use</code> - Use a token
        </li>
        <li>
          <code>POST /v1/permissions/:id/revoke</code> - Revoke a token
        </li>
      </ul>

      <h2>Request Permission</h2>

      <p>Request a new permission for a sensitive operation.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/permissions/request
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
              <td className="py-2 px-4 font-mono">action</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">The action being requested (e.g., &quot;email.send&quot;)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">resource</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">The specific resource (e.g., &quot;email:user@example.com&quot;)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">scope</td>
              <td className="py-2 px-4">object</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Scope constraints for the permission</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">context</td>
              <td className="py-2 px-4">object</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Additional context for approval decisions</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">ttl</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Token TTL in seconds (default: 300, max: 3600)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>

      <pre className="language-json">
        <code>{`{
  "action": "email.send",
  "resource": "email:client@example.com",
  "scope": {
    "max_emails": 1,
    "allowed_recipients": ["client@example.com"],
    "subject_pattern": "^Invoice #\\\\d+$"
  },
  "context": {
    "reason": "Sending monthly invoice",
    "triggered_by": "scheduled_task",
    "invoice_id": "inv_12345"
  },
  "ttl": 300
}`}</code>
      </pre>

      <h3>Response</h3>

      <h4>Auto-Approved (200 OK)</h4>

      <pre className="language-json">
        <code>{`{
  "id": "perm_xxxxxxxxxxxx",
  "status": "approved",
  "token": "otp_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "scope": {
    "max_emails": 1,
    "allowed_recipients": ["client@example.com"]
  },
  "expires_at": "2026-01-28T12:05:00Z",
  "created_at": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <h4>Pending Approval (202 Accepted)</h4>

      <pre className="language-json">
        <code>{`{
  "id": "perm_xxxxxxxxxxxx",
  "status": "pending",
  "approval_url": "https://app.agentotp.com/approve/perm_xxxx",
  "websocket_url": "wss://api.agentotp.com/ws/perm_xxxx",
  "expires_at": "2026-01-28T12:05:00Z",
  "created_at": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <h4>Denied (403 Forbidden)</h4>

      <pre className="language-json">
        <code>{`{
  "id": "perm_xxxxxxxxxxxx",
  "status": "denied",
  "reason": "Action not permitted by policy",
  "denied_by": "policy",
  "policy_id": "pol_xxxx"
}`}</code>
      </pre>

      <h2>Get Permission Status</h2>

      <p>Check the current status of a permission request.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`GET /v1/permissions/:id
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "id": "perm_xxxxxxxxxxxx",
  "status": "approved",
  "action": "email.send",
  "resource": "email:client@example.com",
  "scope": {
    "max_emails": 1
  },
  "context": {
    "reason": "Sending monthly invoice"
  },
  "decided_by": "user",
  "decided_at": "2026-01-28T12:02:30Z",
  "expires_at": "2026-01-28T12:05:00Z",
  "created_at": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <h2>Verify Token</h2>

      <p>Verify that a token is still valid without consuming it.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/permissions/:id/verify
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "token": "otp_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "valid": true,
  "scope": {
    "max_emails": 1
  },
  "uses_remaining": 1,
  "expires_at": "2026-01-28T12:05:00Z"
}`}</code>
      </pre>

      <h2>Use Token</h2>

      <p>Mark a token as used after performing the operation.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/permissions/:id/use
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "token": "otp_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "details": {
    "recipient": "client@example.com",
    "subject": "Invoice #12345",
    "sent_at": "2026-01-28T12:03:00Z"
  }
}`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "success": true,
  "uses_remaining": 0
}`}</code>
      </pre>

      <h2>Revoke Token</h2>

      <p>Revoke a token before it expires or is fully used.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/permissions/:id/revoke
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "token": "otp_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "reason": "Operation cancelled by user"
}`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "success": true,
  "revoked_at": "2026-01-28T12:04:00Z"
}`}</code>
      </pre>

      <h2>WebSocket Updates</h2>

      <p>
        Connect to the WebSocket URL for real-time status updates:
      </p>

      <pre className="language-typescript">
        <code>{`const ws = new WebSocket('wss://api.agentotp.com/ws/perm_xxxx');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'status_change':
      console.log('Status:', data.status);
      if (data.status === 'approved') {
        console.log('Token:', data.token);
      }
      break;
    case 'expired':
      console.log('Permission expired');
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
              <td className="py-2 px-4">Permission not found</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">410</td>
              <td className="py-2 px-4 font-mono">TOKEN_EXPIRED</td>
              <td className="py-2 px-4">Token has expired</td>
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
          <Link href="/docs/concepts/permissions" className="text-primary hover:underline">
            Permissions Concept
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/tokens" className="text-primary hover:underline">
            Tokens Concept
          </Link>
        </li>
        <li>
          <Link href="/docs/api/policies" className="text-primary hover:underline">
            Policies API
          </Link>
        </li>
      </ul>
    </article>
  );
}
