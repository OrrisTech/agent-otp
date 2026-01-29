import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Permissions',
  description: 'Understand how permissions work in Agent OTP. Learn about actions, resources, scopes, and the permission lifecycle.',
};

export default function PermissionsPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Permissions</h1>

      <p className="lead text-xl text-muted-foreground">
        Permissions are the core concept in Agent OTP. A permission grants an AI agent
        the ability to perform a specific action on a specific resource, with
        defined constraints.
      </p>

      <h2>Anatomy of a Permission</h2>

      <p>Every permission request consists of four key components:</p>

      <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">1</span>
            Action
          </h3>
          <p className="text-sm text-muted-foreground">
            What the agent wants to do (e.g., <code>email.send</code>, <code>file.write</code>)
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">2</span>
            Resource
          </h3>
          <p className="text-sm text-muted-foreground">
            The target of the action (e.g., <code>email:user@example.com</code>)
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">3</span>
            Scope
          </h3>
          <p className="text-sm text-muted-foreground">
            Constraints on the permission (e.g., <code>max_emails: 1</code>)
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold">4</span>
            Context
          </h3>
          <p className="text-sm text-muted-foreground">
            Additional information for approval decisions (e.g., <code>reason: &quot;Sending invoice&quot;</code>)
          </p>
        </div>
      </div>

      <h2>Action Naming Convention</h2>

      <p>
        Actions follow a hierarchical naming pattern: <code>category.operation</code>.
        This allows for flexible policy matching:
      </p>

      <pre className="language-text">
        <code>{`email.send        # Send an email
email.read        # Read emails
email.*           # Any email operation

file.read         # Read a file
file.write        # Write a file
file.delete       # Delete a file

bank.transfer     # Transfer money
bank.balance      # Check balance

api.call          # Make an API call
shell.execute     # Execute a shell command`}</code>
      </pre>

      <h2>Resource Identifiers</h2>

      <p>
        Resources use a <code>type:identifier</code> format to clearly specify
        what is being accessed:
      </p>

      <pre className="language-text">
        <code>{`email:user@example.com     # A specific email address
file:/path/to/file.txt     # A specific file path
table:users                # A database table
account:checking           # A bank account
api:stripe.com             # An API endpoint
env:production             # An environment`}</code>
      </pre>

      <h2>Permission Lifecycle</h2>

      <div className="not-prose my-8">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-8">
            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <h3 className="font-semibold">Request</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Agent requests permission via SDK. Request is assigned a unique ID.
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <h3 className="font-semibold">Evaluate</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Policy engine evaluates the request against configured policies.
                Determines if auto-approve, require approval, or deny.
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <h3 className="font-semibold">Approve</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If auto-approved, token is issued immediately. If human approval
                required, notification is sent and agent waits.
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                4
              </div>
              <h3 className="font-semibold">Issue Token</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upon approval, a scoped, ephemeral token is generated and
                returned to the agent.
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                5
              </div>
              <h3 className="font-semibold">Use</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Agent uses the token to perform the operation. Token is marked
                as used (one-time use by default).
              </p>
            </div>
            <div className="relative pl-10">
              <div className="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">
                6
              </div>
              <h3 className="font-semibold">Expire</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Token expires after use, after TTL, or when manually revoked.
                All actions are logged in the audit trail.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2>Permission Statuses</h2>

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
              <td className="py-2 px-4 font-mono text-amber-600">pending</td>
              <td className="py-2 px-4">Waiting for human approval</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono text-green-600">approved</td>
              <td className="py-2 px-4">Permission granted, token issued</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono text-red-600">denied</td>
              <td className="py-2 px-4">Permission denied by policy or human</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono text-gray-600">expired</td>
              <td className="py-2 px-4">Request or token has expired</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono text-blue-600">used</td>
              <td className="py-2 px-4">Token has been consumed</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Example Request</h2>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  // What action to perform
  action: 'email.send',

  // Target resource
  resource: 'email:client@acme.com',

  // Constraints on the permission
  scope: {
    max_emails: 1,
    subject_pattern: '^Invoice #[0-9]+$',
    attachment_allowed: true,
    max_attachment_size: 5242880, // 5MB
  },

  // Context for approval decision
  context: {
    reason: 'Sending monthly invoice to client',
    invoice_id: 'INV-2024-001',
    triggered_by: 'scheduled_task',
  },

  // How long the token should be valid (seconds)
  ttl: 300, // 5 minutes

  // Wait for approval before returning
  waitForApproval: true,
  timeout: 60000, // 60 second timeout
});`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/tokens" className="text-primary hover:underline">
            Tokens - Understanding ephemeral access tokens
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/policies" className="text-primary hover:underline">
            Policies - Configuring auto-approval rules
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/scopes" className="text-primary hover:underline">
            Scopes - Defining permission constraints
          </Link>
        </li>
      </ul>
    </article>
  );
}
