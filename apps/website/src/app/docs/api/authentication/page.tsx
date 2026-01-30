import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication - API Reference',
  description: 'Learn how to authenticate with the Agent OTP API using API keys and bearer tokens.',
};

export default function AuthenticationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Authentication</h1>

      <p className="lead text-xl text-muted-foreground">
        All API requests to Agent OTP require authentication using API keys.
        This guide covers how to authenticate your requests.
      </p>

      <h2>API Keys</h2>

      <p>
        API keys are used to authenticate requests from your agents. Each agent
        has its own API key, which is used to identify and authorize the agent.
      </p>

      <h3>Creating an API Key</h3>

      <ol>
        <li>Log in to your Agent OTP dashboard</li>
        <li>Navigate to <strong>Agents</strong></li>
        <li>Click <strong>Create Agent</strong></li>
        <li>Enter a name and description</li>
        <li>Copy the generated API key</li>
      </ol>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Important:</strong> API keys are only shown once. Store them
          securely in your environment variables or secrets manager.
        </p>
      </div>

      <h3>API Key Format</h3>

      <p>API keys follow this format:</p>

      <pre className="language-text">
        <code>{`ak_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
└─┬──┘ └─┬─┘ └──────────────┬──────────────┘
  │     │                   │
  │     │                   └── 32-character random string
  │     └── Environment (live or test)
  └── Key type prefix`}</code>
      </pre>

      <h2>Using API Keys</h2>

      <h3>Bearer Token (Recommended)</h3>

      <p>
        Include your API key in the <code>Authorization</code> header:
      </p>

      <pre className="language-bash">
        <code>{`curl -X POST https://api.agentotp.com/v1/permissions/request \\
  -H "Authorization: Bearer ak_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "email.send", "scope": {}}'`}</code>
      </pre>

      <h3>X-API-Key Header</h3>

      <p>Alternatively, use the X-API-Key header:</p>

      <pre className="language-bash">
        <code>{`curl -X POST https://api.agentotp.com/v1/permissions/request \\
  -H "X-API-Key: ak_live_xxxx" \\
  -H "Content-Type: application/json" \\
  -d '{"action": "email.send", "scope": {}}'`}</code>
      </pre>

      <h3>SDK Authentication</h3>

      <p>When using the SDK, pass the API key to the constructor:</p>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});`}</code>
      </pre>

      <h2>Test vs. Live Keys</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Key Type</th>
              <th className="py-2 px-4 text-left font-semibold">Prefix</th>
              <th className="py-2 px-4 text-left font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Live</td>
              <td className="py-2 px-4 font-mono">ak_live_</td>
              <td className="py-2 px-4">Production use, counts against quotas</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Test</td>
              <td className="py-2 px-4 font-mono">ak_test_</td>
              <td className="py-2 px-4">Development use, does not count against quotas</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Test keys auto-approve all requests and do not send notifications. Use
        them for development and testing only.
      </p>

      <h2>Key Rotation</h2>

      <p>
        You can rotate API keys without downtime:
      </p>

      <ol>
        <li>Create a new API key for the agent</li>
        <li>Update your application to use the new key</li>
        <li>Verify the new key is working</li>
        <li>Revoke the old key</li>
      </ol>

      <pre className="language-typescript">
        <code>{`// Support multiple keys during rotation
const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY_NEW
    || process.env.AGENT_OTP_API_KEY!,
});`}</code>
      </pre>

      <h2>Revoking Keys</h2>

      <p>
        Revoke compromised or unused keys immediately:
      </p>

      <ol>
        <li>Go to the Agent OTP dashboard</li>
        <li>Navigate to <strong>Agents</strong></li>
        <li>Select the agent</li>
        <li>Click <strong>Revoke API Key</strong></li>
      </ol>

      <p>
        Revoked keys will receive a <code>401 Unauthorized</code> response.
      </p>

      <h2>Rate Limits</h2>

      <p>
        API keys are subject to rate limits based on your plan:
      </p>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Plan</th>
              <th className="py-2 px-4 text-left font-semibold">Requests/min</th>
              <th className="py-2 px-4 text-left font-semibold">Requests/month</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Free</td>
              <td className="py-2 px-4">10</td>
              <td className="py-2 px-4">100</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Pro</td>
              <td className="py-2 px-4">60</td>
              <td className="py-2 px-4">10,000</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Team</td>
              <td className="py-2 px-4">300</td>
              <td className="py-2 px-4">100,000</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Enterprise</td>
              <td className="py-2 px-4">Custom</td>
              <td className="py-2 px-4">Custom</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Authentication Errors</h2>

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
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4 font-mono">MISSING_API_KEY</td>
              <td className="py-2 px-4">No API key provided</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4 font-mono">INVALID_API_KEY</td>
              <td className="py-2 px-4">API key is malformed or doesn&apos;t exist</td>
            </tr>
            <tr>
              <td className="py-2 px-4">401</td>
              <td className="py-2 px-4 font-mono">EXPIRED_API_KEY</td>
              <td className="py-2 px-4">API key has been revoked or expired</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Security Best Practices</h2>

      <ul>
        <li>
          <strong>Never expose keys in client-side code</strong> - Only use API
          keys in server-side code
        </li>
        <li>
          <strong>Use environment variables</strong> - Store keys in environment
          variables, not in code
        </li>
        <li>
          <strong>Rotate keys regularly</strong> - Rotate API keys every 90 days
        </li>
        <li>
          <strong>Monitor usage</strong> - Set up alerts for unusual API usage
        </li>
        <li>
          <strong>Use separate keys per environment</strong> - Different keys for
          dev, staging, production
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/configuration" className="text-primary hover:underline">
            Configuration Guide
          </Link>
        </li>
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
      </ul>
    </article>
  );
}
