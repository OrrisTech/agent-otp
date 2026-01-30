import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Policy Best Practices',
  description: 'Learn best practices for designing and managing Agent OTP permission policies.',
};

export default function PolicyBestPracticesPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Policy Best Practices</h1>

      <p className="lead text-xl text-muted-foreground">
        Design effective permission policies that balance security with
        usability. Learn patterns for common scenarios.
      </p>

      <h2>Policy Design Principles</h2>

      <h3>1. Start Restrictive, Then Relax</h3>

      <p>
        Begin with strict policies and gradually add auto-approvals based on
        observed patterns and trust levels.
      </p>

      <pre className="language-yaml">
        <code>{`# Default: require approval for everything
- name: "Default require approval"
  conditions: {}
  action: require_approval
  priority: -1000

# Then add specific auto-approvals
- name: "Auto-approve read operations"
  conditions:
    action:
      starts_with: "file.read"
  action: auto_approve
  priority: 10`}</code>
      </pre>

      <h3>2. Use Explicit Denies for Dangerous Operations</h3>

      <p>
        Always explicitly deny operations that should never be allowed:
      </p>

      <pre className="language-yaml">
        <code>{`# Deny dangerous operations regardless of other policies
- name: "Block system commands"
  conditions:
    action:
      in: ["system.exec", "system.shell", "process.spawn"]
  action: deny
  priority: 1000

- name: "Block credential access"
  conditions:
    resource:
      matches: ".*(password|secret|key|token).*"
  action: deny
  priority: 1000`}</code>
      </pre>

      <h3>3. Layer Policies by Specificity</h3>

      <p>
        Use priority to ensure more specific policies override general ones:
      </p>

      <pre className="language-yaml">
        <code>{`# Most specific: high priority
- name: "Production database"
  conditions:
    action:
      equals: "database.query"
    context.environment:
      equals: "production"
  action: require_approval
  priority: 100

# Medium specific
- name: "Any database write"
  conditions:
    action:
      in: ["database.insert", "database.update", "database.delete"]
  action: require_approval
  priority: 50

# Least specific: low priority
- name: "Database reads"
  conditions:
    action:
      equals: "database.query"
  action: auto_approve
  priority: 10`}</code>
      </pre>

      <h2>Common Policy Patterns</h2>

      <h3>Read vs. Write Operations</h3>

      <pre className="language-yaml">
        <code>{`# Auto-approve reads
- name: "File reads"
  conditions:
    action:
      equals: "file.read"
  action: auto_approve
  scope_template:
    max_size: 10485760  # 10MB

# Require approval for writes
- name: "File writes"
  conditions:
    action:
      equals: "file.write"
  action: require_approval

# Deny deletes
- name: "File deletes"
  conditions:
    action:
      equals: "file.delete"
  action: deny`}</code>
      </pre>

      <h3>Internal vs. External Communications</h3>

      <pre className="language-yaml">
        <code>{`# Auto-approve internal emails
- name: "Internal emails"
  conditions:
    action:
      equals: "email.send"
    context.recipient:
      matches: ".*@mycompany\\.com$"
  action: auto_approve
  scope_template:
    max_emails: 10

# Require approval for external emails
- name: "External emails"
  conditions:
    action:
      equals: "email.send"
  action: require_approval
  scope_template:
    max_emails: 1`}</code>
      </pre>

      <h3>Time-Based Policies</h3>

      <pre className="language-yaml">
        <code>{`# Auto-approve during business hours
- name: "Business hours operations"
  conditions:
    action:
      starts_with: "workflow."
    context.time_of_day:
      in: ["business_hours"]
  action: auto_approve

# Require approval outside business hours
- name: "After-hours operations"
  conditions:
    action:
      starts_with: "workflow."
    context.time_of_day:
      in: ["night", "weekend"]
  action: require_approval`}</code>
      </pre>

      <h3>Amount-Based Policies</h3>

      <pre className="language-yaml">
        <code>{`# Auto-approve small transfers
- name: "Small transfers"
  conditions:
    action:
      equals: "payment.transfer"
    scope.amount:
      less_than: 100
  action: auto_approve

# Require approval for medium transfers
- name: "Medium transfers"
  conditions:
    action:
      equals: "payment.transfer"
    scope.amount:
      less_than: 1000
  action: require_approval

# Deny large transfers (require manual process)
- name: "Large transfers"
  conditions:
    action:
      equals: "payment.transfer"
    scope.amount:
      greater_than: 1000
  action: deny`}</code>
      </pre>

      <h2>Agent-Specific Policies</h2>

      <p>
        Create policies for specific agents with different trust levels:
      </p>

      <pre className="language-yaml">
        <code>{`# Trusted agent: more auto-approvals
- name: "Trusted agent operations"
  agent_id: "agent_trusted_xxxx"
  conditions:
    action:
      not_in: ["system.exec", "database.drop"]
  action: auto_approve
  priority: 50

# New agent: require approval for everything
- name: "New agent operations"
  agent_id: "agent_new_xxxx"
  conditions: {}
  action: require_approval
  priority: 50

# Restricted agent: deny most operations
- name: "Restricted agent"
  agent_id: "agent_restricted_xxxx"
  conditions:
    action:
      not_in: ["file.read", "web.search"]
  action: deny
  priority: 100`}</code>
      </pre>

      <h2>Scope Templates</h2>

      <p>
        Use scope templates to enforce consistent limits:
      </p>

      <pre className="language-yaml">
        <code>{`- name: "API calls"
  conditions:
    action:
      equals: "api.call"
  action: auto_approve
  scope_template:
    # Rate limits
    max_requests_per_minute: 10
    max_requests_per_hour: 100

    # Size limits
    max_request_size: 1048576
    max_response_size: 10485760

    # Allowed endpoints
    allowed_domains:
      - "api.example.com"
      - "api.another.com"

    # Blocked endpoints
    blocked_paths:
      - "/admin/*"
      - "/internal/*"

    # Timeout
    timeout_seconds: 30`}</code>
      </pre>

      <h2>Testing Policies</h2>

      <p>
        Test your policies before deploying to production:
      </p>

      <pre className="language-typescript">
        <code>{`// Use test API key for policy testing
const testClient = new AgentOTPClient({
  apiKey: 'ak_test_xxxx',
});

// Test that read operations are auto-approved
const readPermission = await testClient.requestPermission({
  action: 'file.read',
  scope: { max_size: 1000 },
});
console.assert(readPermission.status === 'approved');

// Test that writes require approval
const writePermission = await testClient.requestPermission({
  action: 'file.write',
  scope: { max_size: 1000 },
  waitForApproval: false,
});
console.assert(writePermission.status === 'pending');

// Test that deletes are denied
const deletePermission = await testClient.requestPermission({
  action: 'file.delete',
  scope: {},
});
console.assert(deletePermission.status === 'denied');`}</code>
      </pre>

      <h2>Policy Versioning</h2>

      <p>
        Track policy changes for compliance:
      </p>

      <pre className="language-yaml">
        <code>{`# policies/v2/file-operations.yaml
# Version: 2.0
# Author: security-team
# Date: 2026-01-15
# Changes: Added explicit deny for .env files

- name: "Deny .env access"
  conditions:
    resource:
      matches: ".*\\.env.*"
  action: deny
  priority: 1000

- name: "File reads"
  conditions:
    action:
      equals: "file.read"
  action: auto_approve`}</code>
      </pre>

      <h2>Monitoring & Alerts</h2>

      <p>
        Set up alerts for policy violations:
      </p>

      <pre className="language-typescript">
        <code>{`// Monitor denied requests
const deniedRequests = await otp.getAuditLogs({
  eventType: 'deny',
  startDate: oneDayAgo,
});

if (deniedRequests.length > threshold) {
  // Alert security team
  sendAlert({
    type: 'high_denial_rate',
    count: deniedRequests.length,
    details: deniedRequests.slice(0, 10),
  });
}

// Monitor unusual patterns
const approvalsByAction = groupBy(auditLogs, 'action');
for (const [action, logs] of Object.entries(approvalsByAction)) {
  if (logs.length > normalRate[action] * 3) {
    sendAlert({
      type: 'unusual_activity',
      action,
      count: logs.length,
    });
  }
}`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/policies" className="text-primary hover:underline">
            Policies Concept
          </Link>
        </li>
        <li>
          <Link href="/docs/api/policies" className="text-primary hover:underline">
            Policies API
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
