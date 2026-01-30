import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agents API - API Reference',
  description: 'Complete API reference for managing agents in Agent OTP - create, update, and configure AI agents.',
};

export default function AgentsAPIPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Agents API</h1>

      <p className="lead text-xl text-muted-foreground">
        The Agents API allows you to create, manage, and configure AI agents
        that interact with the Agent OTP service.
      </p>

      <h2>Endpoints</h2>

      <ul>
        <li>
          <code>GET /v1/agents</code> - List all agents
        </li>
        <li>
          <code>POST /v1/agents</code> - Create a new agent
        </li>
        <li>
          <code>GET /v1/agents/:id</code> - Get an agent
        </li>
        <li>
          <code>PUT /v1/agents/:id</code> - Update an agent
        </li>
        <li>
          <code>DELETE /v1/agents/:id</code> - Delete an agent
        </li>
        <li>
          <code>POST /v1/agents/:id/rotate-key</code> - Rotate API key
        </li>
      </ul>

      <h2>List Agents</h2>

      <p>Get all agents for your account.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`GET /v1/agents?active=true
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
              <td className="py-2 px-4 font-mono">active</td>
              <td className="py-2 px-4">boolean</td>
              <td className="py-2 px-4">Filter by active status</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">limit</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">Results per page (default: 20)</td>
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
      "id": "agent_xxxxxxxxxxxx",
      "name": "Invoice Bot",
      "description": "Handles invoice generation and sending",
      "api_key_prefix": "ak_live_",
      "metadata": {
        "environment": "production",
        "team": "billing"
      },
      "is_active": true,
      "last_activity_at": "2026-01-28T11:45:00Z",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-28T11:45:00Z"
    }
  ],
  "has_more": false,
  "next_cursor": null
}`}</code>
      </pre>

      <h2>Create Agent</h2>

      <p>Create a new agent and receive its API key.</p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/agents
Content-Type: application/json
Authorization: Bearer your_user_token`}</code>
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
              <td className="py-2 px-4">Agent name (max 255 chars)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">description</td>
              <td className="py-2 px-4">string</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Agent description</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">metadata</td>
              <td className="py-2 px-4">object</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Custom metadata</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4>Example Request</h4>

      <pre className="language-json">
        <code>{`{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries and ticket management",
  "metadata": {
    "environment": "production",
    "team": "support",
    "version": "1.2.0"
  }
}`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "id": "agent_xxxxxxxxxxxx",
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries and ticket management",
  "api_key": "ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "api_key_prefix": "ak_live_",
  "metadata": {
    "environment": "production",
    "team": "support",
    "version": "1.2.0"
  },
  "is_active": true,
  "created_at": "2026-01-28T12:00:00Z",
  "updated_at": "2026-01-28T12:00:00Z"
}`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Important:</strong> The full <code>api_key</code> is only
          returned once during creation. Store it securely immediately.
        </p>
      </div>

      <h2>Get Agent</h2>

      <pre className="language-bash">
        <code>{`GET /v1/agents/:id
Authorization: Bearer your_user_token`}</code>
      </pre>

      <h2>Update Agent</h2>

      <pre className="language-bash">
        <code>{`PUT /v1/agents/:id
Content-Type: application/json
Authorization: Bearer your_user_token`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "name": "Updated Agent Name",
  "description": "Updated description",
  "metadata": {
    "version": "2.0.0"
  },
  "is_active": true
}`}</code>
      </pre>

      <h2>Delete Agent</h2>

      <p>
        Deleting an agent revokes its API key and removes all associated data.
      </p>

      <pre className="language-bash">
        <code>{`DELETE /v1/agents/:id
Authorization: Bearer your_user_token`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          <strong>Warning:</strong> This action is irreversible. All permission
          history and tokens for this agent will be permanently deleted.
        </p>
      </div>

      <h2>Rotate API Key</h2>

      <p>
        Generate a new API key for an agent. The old key remains valid for a
        grace period (default: 24 hours).
      </p>

      <h3>Request</h3>

      <pre className="language-bash">
        <code>{`POST /v1/agents/:id/rotate-key
Content-Type: application/json
Authorization: Bearer your_user_token`}</code>
      </pre>

      <pre className="language-json">
        <code>{`{
  "grace_period": 86400,
  "revoke_immediately": false
}`}</code>
      </pre>

      <h4>Parameters</h4>

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
              <td className="py-2 px-4 font-mono">grace_period</td>
              <td className="py-2 px-4">number</td>
              <td className="py-2 px-4">Seconds before old key expires (default: 86400)</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">revoke_immediately</td>
              <td className="py-2 px-4">boolean</td>
              <td className="py-2 px-4">Immediately revoke old key (default: false)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "id": "agent_xxxxxxxxxxxx",
  "api_key": "ak_live_yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
  "api_key_prefix": "ak_live_",
  "old_key_expires_at": "2026-01-29T12:00:00Z"
}`}</code>
      </pre>

      <h2>Agent Statistics</h2>

      <p>Get usage statistics for an agent.</p>

      <pre className="language-bash">
        <code>{`GET /v1/agents/:id/stats?period=30d
Authorization: Bearer your_user_token`}</code>
      </pre>

      <h3>Response</h3>

      <pre className="language-json">
        <code>{`{
  "period": "30d",
  "total_requests": 1250,
  "approved_requests": 1100,
  "denied_requests": 50,
  "pending_requests": 25,
  "expired_requests": 75,
  "tokens_issued": 1100,
  "tokens_used": 1050,
  "tokens_revoked": 10,
  "avg_approval_time_ms": 1250
}`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Quick Start Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/api/authentication" className="text-primary hover:underline">
            Authentication
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
