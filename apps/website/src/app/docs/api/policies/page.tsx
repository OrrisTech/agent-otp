import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Policies API - API Reference',
  description: 'Complete API reference for creating and managing permission policies in Agent OTP.',
};

export default function PoliciesAPIPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Policies API</h1>

      <p className="lead text-xl text-muted-foreground">
        The Policies API allows you to create, update, and manage permission
        policies that control how permission requests are handled.
      </p>

      <h2>Endpoints</h2>

      <ul>
        <li>
          <code>GET /v1/policies</code> - List all policies
        </li>
        <li>
          <code>POST /v1/policies</code> - Create a new policy
        </li>
        <li>
          <code>GET /v1/policies/:id</code> - Get a policy
        </li>
        <li>
          <code>PUT /v1/policies/:id</code> - Update a policy
        </li>
        <li>
          <code>DELETE /v1/policies/:id</code> - Delete a policy
        </li>
      </ul>

      <h2>List Policies</h2>

      <p>Get all policies for your account.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`GET /v1/policies?agent_id=agent_xxxx&active=true
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h4>Query Parameters</h4>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Parameter</th>
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">agent_id</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Filter by agent ID</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">active</td>
              <td className="py-2 px-4">boolean</td>
              <td className="py-2 px-4">Filter by active status</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">limit</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">Results per page (default: 20, max: 100)</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">cursor</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Pagination cursor</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "data": [
    {
      "id": "pol_xxxxxxxxxxxx",
      "name": "Auto-approve file reads",
      "description": "Automatically approve small file read operations",
      "agent_id": null,
      "priority": 10,
      "conditions": {
        "action": { "equals": "file.read" },
        "scope.max_size": { "less_than": 1048576 }
      },
      "action": "auto_approve",
      "scope_template": {
        "max_size": 1048576
      },
      "is_active": true,
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ],
  "has_more": false,
  "next_cursor": null
}`}</code>
      </pre>

      <h2>Create Policy</h2>

      <p>Create a new permission policy.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/policies
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
              <td className="py-2 px-4 font-mono">name</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Human-readable policy name</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">description</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Policy description</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">agent_id</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Apply to specific agent (null = all)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">priority</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Evaluation order (higher = first)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">conditions</td>
              <td className="py-2 px-4">object</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Matching conditions</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">action</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">auto_approve, require_approval, or deny</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">scope_template</td>
              <td className="py-2 px-4">object</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Default scope to apply</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>

      <pre className="language-json">
        <code>{`{
  "name": "Auto-approve internal emails",
  "description": "Auto-approve emails to company domain",
  "priority": 50,
  "conditions": {
    "action": { "equals": "email.send" },
    "context.recipient": { "matches": ".*@mycompany\\\\.com$" }
  },
  "action": "auto_approve",
  "scope_template": {
    "max_emails": 5,
    "ttl": 600
  }
}`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "id": "pol_xxxxxxxxxxxx",
  "name": "Auto-approve internal emails",
  "description": "Auto-approve emails to company domain",
  "agent_id": null,
  "priority": 50,
  "conditions": {
    "action": { "equals": "email.send" },
    "context.recipient": { "matches": ".*@mycompany\\\\.com$" }
  },
  "action": "auto_approve",
  "scope_template": {
    "max_emails": 5,
    "ttl": 600
  },
  "is_active": true,
  "created_at": "2026-01-28T12:00:00Z",
  "updated_at": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <h2>Condition Operators</h2>

      <p>Policies support various condition operators:</p>

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
              <td className="py-2 px-4 font-mono">{`{"equals": "file.read"}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">not_equals</td>
              <td className="py-2 px-4">Not equal</td>
              <td className="py-2 px-4 font-mono">{`{"not_equals": "admin"}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">starts_with</td>
              <td className="py-2 px-4">String prefix</td>
              <td className="py-2 px-4 font-mono">{`{"starts_with": "file."}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">ends_with</td>
              <td className="py-2 px-4">String suffix</td>
              <td className="py-2 px-4 font-mono">{`{"ends_with": ".csv"}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">matches</td>
              <td className="py-2 px-4">Regex match</td>
              <td className="py-2 px-4 font-mono">{`{"matches": "^Invoice #\\\\d+$"}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">less_than</td>
              <td className="py-2 px-4">Numeric comparison</td>
              <td className="py-2 px-4 font-mono">{`{"less_than": 1048576}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">greater_than</td>
              <td className="py-2 px-4">Numeric comparison</td>
              <td className="py-2 px-4 font-mono">{`{"greater_than": 0}`}</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">in</td>
              <td className="py-2 px-4">Value in list</td>
              <td className="py-2 px-4 font-mono">{`{"in": ["a", "b"]}`}</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">not_in</td>
              <td className="py-2 px-4">Value not in list</td>
              <td className="py-2 px-4 font-mono">{`{"not_in": ["admin"]}`}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Update Policy</h2>

      <pre className="language-bash">
        <code>{`PUT /v1/policies/:id
Content-Type: application/json
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "name": "Updated policy name",
  "is_active": false
}`}</code>
      </pre>

      <h2>Delete Policy</h2>

      <pre className="language-bash">
        <code>{`DELETE /v1/policies/:id
Authorization: Bearer ak_live_xxxx`}</code>
      </pre>

      <h2>Policy Evaluation Order</h2>

      <p>
        When a permission request is received, policies are evaluated in order:
      </p>

      <ol>
        <li>Policies are sorted by priority (highest first)</li>
        <li>Agent-specific policies are evaluated before global policies</li>
        <li>First matching policy determines the action</li>
        <li>If no policy matches, the request requires manual approval</li>
      </ol>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/policies" className="text-primary hover:underline">
            Policies Concept
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/policies" className="text-primary hover:underline">
            Policy Best Practices
          </Link>
        </li>
        <li>
          <Link href="/docs/api/permissions" className="text-primary hover:underline">
            Permissions API
          </Link>
        </li>
      </ul>
    </article>
  );
}
