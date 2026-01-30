import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Scopes',
  description: 'Define fine-grained permission boundaries with Agent OTP scopes. Learn about scope constraints and patterns.',
};

export default function ScopesPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Scopes</h1>

      <p className="lead text-xl text-muted-foreground">
        Scopes define the boundaries of what a permission allows. They constrain
        operations to specific resources, limits, and patterns.
      </p>

      <h2>What Are Scopes?</h2>

      <p>
        Scopes are key-value constraints that define exactly what an AI agent
        can do with a granted permission. They enable the principle of least
        privilege by limiting permissions to the minimum necessary.
      </p>

      <pre className="language-typescript">
        <code>{`const permission = await otp.requestPermission({
  action: 'email.send',
  resource: 'email:client@example.com',
  scope: {
    // Constraints on the operation
    max_emails: 1,
    allowed_recipients: ['client@example.com'],
    subject_pattern: '^Invoice #\\d+$',
    attachment_allowed: false,
    max_body_size: 10000,
  },
});`}</code>
      </pre>

      <h2>Common Scope Patterns</h2>

      <h3>Numeric Limits</h3>

      <p>Constrain quantities and sizes:</p>

      <pre className="language-typescript">
        <code>{`scope: {
  max_count: 10,          // Maximum number of operations
  max_size: 1048576,      // Maximum size in bytes
  max_amount: 100.00,     // Maximum monetary amount
  max_duration: 3600,     // Maximum duration in seconds
}`}</code>
      </pre>

      <h3>Resource Patterns</h3>

      <p>Limit which resources can be accessed:</p>

      <pre className="language-typescript">
        <code>{`scope: {
  // Exact matches
  allowed_paths: ['/data/reports/', '/data/exports/'],

  // Pattern matching
  path_pattern: '^/data/(reports|exports)/.*\\.csv$',

  // Glob patterns
  allowed_globs: ['*.csv', '*.json'],

  // Exclusions
  excluded_paths: ['/data/sensitive/'],
}`}</code>
      </pre>

      <h3>String Patterns</h3>

      <p>Validate string content with regex:</p>

      <pre className="language-typescript">
        <code>{`scope: {
  // Email patterns
  subject_pattern: '^(Invoice|Receipt) #\\d+$',
  body_pattern: 'Dear \\w+',

  // Content restrictions
  allowed_content_types: ['text/plain', 'text/html'],

  // Message validation
  required_prefix: '[AUTOMATED]',
}`}</code>
      </pre>

      <h3>Time Windows</h3>

      <p>Restrict when operations can occur:</p>

      <pre className="language-typescript">
        <code>{`scope: {
  // Business hours only
  allowed_hours: { start: 9, end: 17 },
  allowed_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],

  // Timezone
  timezone: 'America/New_York',

  // Rate limiting
  rate_limit: { max: 10, per: 'minute' },
}`}</code>
      </pre>

      <h3>Boolean Flags</h3>

      <p>Enable or disable specific capabilities:</p>

      <pre className="language-typescript">
        <code>{`scope: {
  // Feature flags
  attachment_allowed: false,
  delete_allowed: false,
  overwrite_allowed: true,

  // Safety flags
  dry_run: true,
  require_confirmation: true,
}`}</code>
      </pre>

      <h2>Scope Inheritance</h2>

      <p>
        Granted scopes inherit from policy defaults and may be more restrictive
        than requested:
      </p>

      <pre className="language-typescript">
        <code>{`// Agent requests
const request = {
  scope: { max_size: 10485760 }, // 10MB
};

// Policy template says max 1MB
const policyScope = { max_size: 1048576 };

// Granted scope is the most restrictive
const grantedScope = { max_size: 1048576 }; // 1MB`}</code>
      </pre>

      <h2>Scope Validation</h2>

      <p>
        The SDK validates scopes before sending requests. Invalid scopes result
        in a <code>ValidationError</code>:
      </p>

      <pre className="language-typescript">
        <code>{`try {
  await otp.requestPermission({
    action: 'file.write',
    scope: {
      max_size: -1, // Invalid: negative value
    },
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.details);
    // { max_size: 'must be a positive integer' }
  }
}`}</code>
      </pre>

      <h2>Action-Specific Scopes</h2>

      <p>
        Different actions support different scope fields. Here are examples for
        common actions:
      </p>

      <h3>email.send</h3>

      <pre className="language-typescript">
        <code>{`scope: {
  max_emails: number,
  allowed_recipients: string[],
  blocked_recipients: string[],
  subject_pattern: string,
  body_max_length: number,
  attachment_allowed: boolean,
  attachment_max_size: number,
  allowed_attachment_types: string[],
}`}</code>
      </pre>

      <h3>file.read / file.write</h3>

      <pre className="language-typescript">
        <code>{`scope: {
  max_size: number,
  allowed_paths: string[],
  blocked_paths: string[],
  path_pattern: string,
  allowed_extensions: string[],
  create_allowed: boolean,
  overwrite_allowed: boolean,
}`}</code>
      </pre>

      <h3>http.request</h3>

      <pre className="language-typescript">
        <code>{`scope: {
  allowed_domains: string[],
  blocked_domains: string[],
  allowed_methods: string[],
  max_redirects: number,
  max_response_size: number,
  timeout: number,
}`}</code>
      </pre>

      <h3>database.query</h3>

      <pre className="language-typescript">
        <code>{`scope: {
  allowed_tables: string[],
  blocked_tables: string[],
  allowed_operations: string[], // 'SELECT', 'INSERT', etc.
  max_rows: number,
  max_execution_time: number,
}`}</code>
      </pre>

      <h2>Custom Scopes</h2>

      <p>
        You can define custom scope fields for your application&apos;s needs:
      </p>

      <pre className="language-typescript">
        <code>{`scope: {
  // Standard fields
  max_count: 1,

  // Custom fields for your app
  allowed_project_ids: ['proj_123', 'proj_456'],
  required_approval_level: 'manager',
  audit_reason_required: true,
}`}</code>
      </pre>

      <p>
        Custom scope fields are validated against your policy definitions and
        included in the audit trail.
      </p>

      <h2>Scope in Policies</h2>

      <p>
        Policies can define scope templates that apply to matching requests:
      </p>

      <pre className="language-yaml">
        <code>{`- name: "File operations policy"
  conditions:
    action:
      starts_with: "file."
  action: auto_approve
  scope_template:
    max_size: 1048576        # 1MB limit
    allowed_paths:
      - "/data/public/"
      - "/tmp/"
    blocked_paths:
      - "/etc/"
      - "/var/secrets/"
    allowed_extensions:
      - ".txt"
      - ".csv"
      - ".json"`}</code>
      </pre>

      <h2>Best Practices</h2>

      <ul>
        <li>
          <strong>Be specific</strong> - Request only the exact scope you need
        </li>
        <li>
          <strong>Use patterns for flexibility</strong> - Regex patterns allow
          controlled variation
        </li>
        <li>
          <strong>Set numeric limits</strong> - Always include max values to
          prevent abuse
        </li>
        <li>
          <strong>Use blocklists for safety</strong> - Block sensitive paths
          even if allow patterns exist
        </li>
        <li>
          <strong>Document custom scopes</strong> - Clearly document what custom
          scope fields mean
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
          <Link href="/docs/concepts/policies" className="text-primary hover:underline">
            Policies
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/tokens" className="text-primary hover:underline">
            Tokens
          </Link>
        </li>
      </ul>
    </article>
  );
}
