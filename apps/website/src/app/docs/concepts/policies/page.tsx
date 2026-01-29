import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Policies',
  description: 'Learn how to configure policies in Agent OTP to auto-approve safe operations and require human review for risky ones.',
};

export default function PoliciesPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Policies</h1>

      <p className="lead text-xl text-muted-foreground">
        Policies are rules that determine how permission requests are handled.
        They can auto-approve safe operations, require human approval for risky
        ones, or outright deny certain requests.
      </p>

      <h2>Policy Structure</h2>

      <p>Each policy consists of:</p>

      <ul>
        <li><strong>Name</strong> - A descriptive name for the policy</li>
        <li><strong>Conditions</strong> - Rules that must match for the policy to apply</li>
        <li><strong>Action</strong> - What to do when the policy matches</li>
        <li><strong>Priority</strong> - Order in which policies are evaluated</li>
        <li><strong>Scope Template</strong> - Default constraints to apply to matching requests</li>
      </ul>

      <pre className="language-yaml">
        <code>{`name: "Auto-approve internal emails"
conditions:
  action:
    equals: "email.send"
  context.recipient:
    matches: ".*@mycompany\\.com$"
action: auto_approve
priority: 100
scope_template:
  max_emails: 5
  ttl: 600`}</code>
      </pre>

      <h2>Policy Actions</h2>

      <div className="not-prose my-8 grid gap-4">
        <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-4">
          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
            auto_approve
          </h3>
          <p className="text-sm">
            The request is approved immediately without human intervention.
            A token is issued and returned to the agent.
          </p>
        </div>
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
            require_approval
          </h3>
          <p className="text-sm">
            The request requires human approval. Notifications are sent via
            configured channels (Telegram, email, webhook). The agent waits
            until approved or timeout.
          </p>
        </div>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
            deny
          </h3>
          <p className="text-sm">
            The request is rejected immediately. No token is issued. Use this
            for operations that should never be allowed.
          </p>
        </div>
      </div>

      <h2>Condition Operators</h2>

      <p>
        Conditions support various operators for matching against request fields:
      </p>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Operator</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
              <th className="py-2 px-4 text-left font-semibold">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">equals</td>
              <td className="py-2 px-4">Exact match</td>
              <td className="py-2 px-4 font-mono text-xs">action: {'{'}equals: &quot;email.send&quot;{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">not_equals</td>
              <td className="py-2 px-4">Not equal to</td>
              <td className="py-2 px-4 font-mono text-xs">status: {'{'}not_equals: &quot;blocked&quot;{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">starts_with</td>
              <td className="py-2 px-4">String prefix match</td>
              <td className="py-2 px-4 font-mono text-xs">action: {'{'}starts_with: &quot;bank.&quot;{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">ends_with</td>
              <td className="py-2 px-4">String suffix match</td>
              <td className="py-2 px-4 font-mono text-xs">resource: {'{'}ends_with: &quot;.pdf&quot;{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">matches</td>
              <td className="py-2 px-4">Regex pattern match</td>
              <td className="py-2 px-4 font-mono text-xs">email: {'{'}matches: &quot;.*@company\\.com$&quot;{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">less_than</td>
              <td className="py-2 px-4">Numeric comparison</td>
              <td className="py-2 px-4 font-mono text-xs">amount: {'{'}less_than: 1000{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">greater_than</td>
              <td className="py-2 px-4">Numeric comparison</td>
              <td className="py-2 px-4 font-mono text-xs">priority: {'{'}greater_than: 5{'}'}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">in</td>
              <td className="py-2 px-4">Value in list</td>
              <td className="py-2 px-4 font-mono text-xs">type: {'{'}in: [&quot;read&quot;, &quot;list&quot;]{'}'}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">not_in</td>
              <td className="py-2 px-4">Value not in list</td>
              <td className="py-2 px-4 font-mono text-xs">action: {'{'}not_in: [&quot;delete&quot;]{'}'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Field Paths</h2>

      <p>
        Conditions can match against any field in the permission request using
        dot notation:
      </p>

      <pre className="language-yaml">
        <code>{`# Match the action field
action:
  equals: "email.send"

# Match the resource field
resource:
  starts_with: "file:/home/user/documents"

# Match fields within scope
scope.max_amount:
  less_than: 1000

# Match fields within context
context.reason:
  matches: ".*invoice.*"

# Match nested fields
context.metadata.priority:
  greater_than: 5`}</code>
      </pre>

      <h2>Policy Evaluation Order</h2>

      <p>
        Policies are evaluated in order of priority (highest first). The first
        matching policy determines the action. If no policy matches, the default
        action is <code>deny</code>.
      </p>

      <div className="not-prose my-8 rounded-lg border border-border p-6 bg-muted/30">
        <h3 className="font-semibold mb-4">Evaluation Example</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-4">
            <span className="flex-none w-20 font-mono text-muted-foreground">Priority 100</span>
            <span className="flex-1">Financial operations → require_approval</span>
            <span className="text-amber-600">⏸ Skip (no match)</span>
          </div>
          <div className="flex items-start gap-4">
            <span className="flex-none w-20 font-mono text-muted-foreground">Priority 50</span>
            <span className="flex-1">Internal emails → auto_approve</span>
            <span className="text-green-600">✓ Match!</span>
          </div>
          <div className="flex items-start gap-4 opacity-50">
            <span className="flex-none w-20 font-mono text-muted-foreground">Priority 10</span>
            <span className="flex-1">External emails → require_approval</span>
            <span className="text-gray-400">— Not evaluated</span>
          </div>
          <div className="flex items-start gap-4 opacity-50">
            <span className="flex-none w-20 font-mono text-muted-foreground">Priority -1000</span>
            <span className="flex-1">Default deny</span>
            <span className="text-gray-400">— Not evaluated</span>
          </div>
        </div>
      </div>

      <h2>Example Policies</h2>

      <h3>Auto-approve file reads</h3>

      <pre className="language-yaml">
        <code>{`name: "Auto-approve small file reads"
conditions:
  action:
    equals: "file.read"
  scope.max_size:
    less_than: 1048576  # 1MB
action: auto_approve
priority: 50
scope_template:
  allowed_extensions: [".txt", ".md", ".json", ".csv"]`}</code>
      </pre>

      <h3>Require approval for financial operations</h3>

      <pre className="language-yaml">
        <code>{`name: "Financial operations need approval"
conditions:
  action:
    starts_with: "bank."
action: require_approval
priority: 100`}</code>
      </pre>

      <h3>Auto-approve low-value transfers</h3>

      <pre className="language-yaml">
        <code>{`name: "Auto-approve small transfers"
conditions:
  action:
    equals: "bank.transfer"
  scope.amount:
    less_than: 100
  scope.currency:
    in: ["USD", "EUR"]
action: auto_approve
priority: 110  # Higher than general financial rule`}</code>
      </pre>

      <h3>Deny dangerous operations</h3>

      <pre className="language-yaml">
        <code>{`name: "Block dangerous commands"
conditions:
  action:
    equals: "shell.execute"
  scope.command:
    matches: ".*(rm -rf|drop table|truncate).*"
action: deny
priority: 1000  # Highest priority`}</code>
      </pre>

      <h2>Best Practices</h2>

      <ul>
        <li>
          <strong>Start restrictive</strong> - Begin with require_approval or deny as
          defaults, then add auto_approve rules for specific safe operations
        </li>
        <li>
          <strong>Use high priority for denies</strong> - Security-critical deny rules
          should have the highest priority
        </li>
        <li>
          <strong>Be specific</strong> - Narrow conditions reduce the chance of
          unintended auto-approvals
        </li>
        <li>
          <strong>Document policies</strong> - Use descriptive names and add comments
          explaining the rationale
        </li>
        <li>
          <strong>Test thoroughly</strong> - Test policies with sample requests before
          deploying to production
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/permissions" className="text-primary hover:underline">
            Permissions - Understanding the permission model
          </Link>
        </li>
        <li>
          <Link href="/docs/api/policies" className="text-primary hover:underline">
            Policies API - Managing policies programmatically
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/policies" className="text-primary hover:underline">
            Policy Best Practices Guide
          </Link>
        </li>
      </ul>
    </article>
  );
}
