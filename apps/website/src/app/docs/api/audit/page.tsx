import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Audit API - API Reference',
  description: 'Complete API reference for querying audit logs and compliance reports in Agent OTP.',
};

export default function AuditAPIPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Audit API</h1>

      <p className="lead text-xl text-muted-foreground">
        The Audit API provides access to comprehensive audit logs for all
        permission requests, approvals, and token usage.
      </p>

      <h2>Endpoints</h2>

      <ul>
        <li>
          <code>GET /v1/audit</code> - Query audit logs
        </li>
        <li>
          <code>GET /v1/audit/:id</code> - Get a specific audit entry
        </li>
        <li>
          <code>POST /v1/audit/export</code> - Export audit logs
        </li>
      </ul>

      <h2>Query Audit Logs</h2>

      <p>Search and filter audit logs.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`GET /v1/audit?agent_id=agent_xxxx&event_type=request&limit=50
Authorization: Bearer your_user_token`}</code>
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
              <td className="py-2 px-4 font-mono">permission_id</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Filter by permission request ID</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">event_type</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Event type filter (see below)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">action</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Filter by action (e.g., &quot;email.send&quot;)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">start_date</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">ISO 8601 start date</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">end_date</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">ISO 8601 end date</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">limit</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">Results per page (default: 50, max: 1000)</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">cursor</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Pagination cursor</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Event Types</h4>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">request</td>
              <td className="py-2 px-4">Permission was requested</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">approve</td>
              <td className="py-2 px-4">Permission was approved</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">deny</td>
              <td className="py-2 px-4">Permission was denied</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">use</td>
              <td className="py-2 px-4">Token was used</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">expire</td>
              <td className="py-2 px-4">Token expired unused</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">revoke</td>
              <td className="py-2 px-4">Token was revoked</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "data": [
    {
      "id": "audit_xxxxxxxxxxxx",
      "user_id": "user_xxxx",
      "agent_id": "agent_xxxx",
      "permission_request_id": "perm_xxxx",
      "event_type": "approve",
      "details": {
        "action": "email.send",
        "resource": "email:client@example.com",
        "scope": {
          "max_emails": 1
        },
        "decided_by": "user",
        "decision_reason": "Manual approval",
        "policy_id": null
      },
      "ip_address": "192.168.1.1",
      "user_agent": "AgentOTP-SDK/1.0.0",
      "created_at": "2026-01-28T12:00:30Z"
    }
  ],
  "has_more": true,
  "next_cursor": "cursor_xxxx"
}`}</code>
      </pre>

      <h2>Get Audit Entry</h2>

      <p>Get details of a specific audit log entry.</p>

      <pre className="language-bash">
        <code>{`GET /v1/audit/:id
Authorization: Bearer your_user_token`}</code>
      </pre>

      <h2>Export Audit Logs</h2>

      <p>Export audit logs in various formats for compliance reporting.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/audit/export
Content-Type: application/json
Authorization: Bearer your_user_token`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "format": "csv",
  "start_date": "2026-01-01T00:00:00Z",
  "end_date": "2026-01-31T23:59:59Z",
  "agent_id": "agent_xxxx",
  "event_types": ["request", "approve", "deny"],
  "include_details": true
}`}</code>
      </pre>

      <h4>Export Parameters</h4>

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
              <td className="py-2 px-4 font-mono">format</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Export format: csv, json, or parquet</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">start_date</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">ISO 8601 start date (required)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">end_date</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">ISO 8601 end date (required)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">agent_id</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">Filter by agent ID</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">event_types</td>
              <td className="py-2 px-4">string[]</td>
              <td className="py-2 px-4">Filter by event types</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">include_details</td>
              <td className="py-2 px-4">boolean</td>
              <td className="py-2 px-4">Include full details JSON</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "export_id": "export_xxxxxxxxxxxx",
  "status": "processing",
  "download_url": null,
  "expires_at": null,
  "created_at": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <p>
        Poll the export status or use webhooks to get notified when the export
        is ready:
      </p>

      <pre className="language-bash">
        <code>{`GET /v1/audit/export/:export_id
Authorization: Bearer your_user_token`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "export_id": "export_xxxxxxxxxxxx",
  "status": "completed",
  "download_url": "https://exports.agentotp.com/export_xxxx.csv",
  "expires_at": "2026-01-29T12:00:00Z",
  "row_count": 15420,
  "file_size_bytes": 2048576,
  "created_at": "2026-01-28T12:00:00Z",
  "completed_at": "2026-01-28T12:01:30Z"
}`}</code>
      </pre>

      <h2>Audit Log Retention</h2>

      <p>
        Audit logs are retained based on your plan:
      </p>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Plan</th>
              <th className="py-2 px-4 text-left font-semibold">Retention</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Free</td>
              <td className="py-2 px-4">7 days</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Pro</td>
              <td className="py-2 px-4">90 days</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Team</td>
              <td className="py-2 px-4">1 year</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Enterprise</td>
              <td className="py-2 px-4">Custom (up to 7 years)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Webhooks</h2>

      <p>
        Configure webhooks to receive real-time audit events:
      </p>

      <pre className="language-json">
        <code>{`// Webhook payload
{
  "event": "audit.created",
  "timestamp": "2026-01-28T12:00:30Z",
  "data": {
    "id": "audit_xxxxxxxxxxxx",
    "event_type": "approve",
    "agent_id": "agent_xxxx",
    "permission_request_id": "perm_xxxx",
    "details": { ... }
  }
}`}</code>
      </pre>

      <h2>Compliance Reports</h2>

      <p>
        Enterprise customers can generate compliance reports:
      </p>

      <pre className="language-bash">
        <code>{`POST /v1/audit/reports/compliance
Content-Type: application/json
Authorization: Bearer your_user_token`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "report_type": "soc2",
  "period": {
    "start": "2026-01-01",
    "end": "2026-03-31"
  },
  "format": "pdf"
}`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/api/permissions" className="text-primary hover:underline">
            Permissions API
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/security" className="text-primary hover:underline">
            Security Best Practices
          </Link>
        </li>
        <li>
          <Link href="/docs/api/agents" className="text-primary hover:underline">
            Agents API
          </Link>
        </li>
      </ul>
    </article>
  );
}
