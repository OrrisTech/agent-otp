import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tokens',
  description: 'Understand how Agent OTP tokens work - ephemeral, scoped credentials for secure AI agent operations.',
};

export default function TokensPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Tokens</h1>

      <p className="lead text-xl text-muted-foreground">
        Tokens are ephemeral, scoped credentials that grant AI agents permission
        to perform specific operations.
      </p>

      <h2>What Are Tokens?</h2>

      <p>
        When a permission request is approved, Agent OTP issues a token. This
        token is:
      </p>

      <ul>
        <li>
          <strong>Ephemeral</strong> - Expires after a short time (default 5
          minutes, max 1 hour)
        </li>
        <li>
          <strong>Scoped</strong> - Only valid for the specific operation and
          resource requested
        </li>
        <li>
          <strong>One-time use</strong> - Can only be used once by default
        </li>
        <li>
          <strong>Auditable</strong> - All token usage is logged for compliance
        </li>
      </ul>

      <h2>Token Lifecycle</h2>

      <pre className="language-text">
        <code>{`Permission Request → Approval → Token Issued → Token Used → Expired
                              ↓
                           Denied
                              ↓
                         No Token`}</code>
      </pre>

      <h3>1. Token Creation</h3>

      <p>
        Tokens are created when a permission request is approved (either
        automatically by a policy or manually by a human):
      </p>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  action: 'file.write',
  resource: 'file:/data/report.csv',
  scope: { max_size: 1048576 },
  waitForApproval: true,
});

if (permission.status === 'approved') {
  // Token is now available
  console.log('Token:', permission.token);
  console.log('Expires:', permission.expiresAt);
}`}</code>
      </pre>

      <h3>2. Token Verification</h3>

      <p>
        You can verify a token is still valid before using it:
      </p>

      <pre className="language-typescript">
        <code>{`const verification = await otp.verifyToken(
  permission.id,
  permission.token
);

if (verification.valid) {
  console.log('Token is valid');
  console.log('Uses remaining:', verification.usesRemaining);
  console.log('Scope:', verification.scope);
}`}</code>
      </pre>

      <h3>3. Token Usage</h3>

      <p>
        After performing the permitted operation, mark the token as used:
      </p>

      <pre className="language-typescript">
        <code>{`// Perform the operation
await writeFile('/data/report.csv', data);

// Mark the token as used
const result = await otp.useToken(permission.id, permission.token, {
  file_path: '/data/report.csv',
  bytes_written: data.length,
});

console.log('Uses remaining:', result.usesRemaining); // 0`}</code>
      </pre>

      <h3>4. Token Expiration</h3>

      <p>
        Tokens automatically expire after their TTL. Attempting to use an
        expired token will fail:
      </p>

      <pre className="language-typescript">
        <code>{`try {
  await otp.useToken(permission.id, permission.token);
} catch (error) {
  if (error.code === 'TOKEN_EXPIRED') {
    console.log('Token has expired, request a new permission');
  }
}`}</code>
      </pre>

      <h2>Token Format</h2>

      <p>
        Tokens are opaque strings that should be treated as secrets:
      </p>

      <pre className="language-text">
        <code>{`otp_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Security:</strong> Never log tokens in plaintext or expose
          them in error messages. They are sensitive credentials.
        </p>
      </div>

      <h2>Token Properties</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Property</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">id</td>
              <td className="py-2 px-4">Unique token identifier</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">scope</td>
              <td className="py-2 px-4">Granted permissions and constraints</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">usesRemaining</td>
              <td className="py-2 px-4">Number of times token can still be used</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">expiresAt</td>
              <td className="py-2 px-4">ISO 8601 timestamp when token expires</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">createdAt</td>
              <td className="py-2 px-4">ISO 8601 timestamp when token was created</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Multi-Use Tokens</h2>

      <p>
        By default, tokens are single-use. For batch operations, you can
        request a multi-use token:
      </p>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  action: 'email.send',
  resource: 'email:*@company.com',
  scope: {
    max_uses: 10,  // Allow up to 10 uses
    max_emails: 10,
    ttl: 3600,     // 1 hour expiry
  },
  context: {
    reason: 'Sending batch notifications to team',
  },
  waitForApproval: true,
});

// Use the token multiple times
for (const recipient of recipients) {
  await sendEmail(recipient);
  await otp.useToken(permission.id, permission.token, {
    recipient,
  });
}`}</code>
      </pre>

      <h2>Token Revocation</h2>

      <p>
        Tokens can be revoked before they expire or are fully used:
      </p>

      <pre className="language-typescript">
        <code>{`// Revoke a token (e.g., if the operation failed)
await otp.revokeToken(permission.id, permission.token);

// Attempting to use a revoked token will fail
try {
  await otp.useToken(permission.id, permission.token);
} catch (error) {
  console.log(error.code); // 'TOKEN_REVOKED'
}`}</code>
      </pre>

      <h2>Token Scope Enforcement</h2>

      <p>
        The granted scope may be more restrictive than what was requested,
        based on policy rules:
      </p>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  action: 'file.write',
  scope: {
    max_size: 10485760, // Requested 10MB
  },
});

// Policy may restrict to smaller size
console.log(permission.scope.max_size); // 1048576 (1MB)`}</code>
      </pre>

      <h2>Best Practices</h2>

      <ul>
        <li>
          <strong>Use tokens immediately</strong> - Don&apos;t store tokens for
          later use
        </li>
        <li>
          <strong>Handle expiration gracefully</strong> - Request a new
          permission if a token expires
        </li>
        <li>
          <strong>Log token IDs, not tokens</strong> - For debugging, log the
          permission ID, not the token itself
        </li>
        <li>
          <strong>Verify before sensitive operations</strong> - Call{' '}
          <code>verifyToken</code> before critical operations
        </li>
        <li>
          <strong>Record usage details</strong> - Pass details to{' '}
          <code>useToken</code> for audit trail
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/permissions" className="text-primary hover:underline">
            Permissions
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/scopes" className="text-primary hover:underline">
            Scopes
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
