import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Configuration',
  description: 'Configure Agent OTP SDK with API keys, environment variables, and advanced options.',
};

export default function ConfigurationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Configuration</h1>

      <p className="lead text-xl text-muted-foreground">
        Learn how to configure the Agent OTP SDK for different environments
        and use cases.
      </p>

      <h2>API Keys</h2>

      <p>
        Every Agent OTP client requires an API key for authentication. You can
        create API keys using the CLI after starting your self-hosted instance:
      </p>

      <pre className="language-bash">
        <code>{`# Create a new agent and get an API key
docker compose exec api bun run cli agent:create --name "my-assistant"`}</code>
      </pre>

      <h3>API Key Format</h3>

      <p>API keys follow this format:</p>

      <pre className="language-text">
        <code>{`ak_live_xxxxxxxxxxxxxxxxxxxx  # Production key
ak_test_xxxxxxxxxxxxxxxxxxxx  # Test/sandbox key`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Security:</strong> Never expose API keys in client-side code
          or commit them to version control. Always use environment variables.
        </p>
      </div>

      <h2>Environment Variables</h2>

      <p>
        We recommend storing your API key in an environment variable:
      </p>

      <pre className="language-bash">
        <code>{`# .env
AGENT_OTP_API_KEY=ak_live_xxxxxxxxxxxxxxxxxxxx

# Optional: for self-hosted deployments
AGENT_OTP_BASE_URL=https://your-instance.com`}</code>
      </pre>

      <h3>Framework-Specific Setup</h3>

      <h4>Next.js</h4>

      <pre className="language-typescript">
        <code>{`// lib/otp.ts
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

export const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});`}</code>
      </pre>

      <h4>Node.js with dotenv</h4>

      <pre className="language-typescript">
        <code>{`import 'dotenv/config';
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

export const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});`}</code>
      </pre>

      <h2>Client Options</h2>

      <p>
        The <code>AgentOTPClient</code> constructor accepts the following options:
      </p>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Option</th>
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Default</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">apiKey</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">string</td>
              <td className="py-2 px-4">-</td>
              <td className="py-2 px-4">Your API key (required)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">baseUrl</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">string</td>
              <td className="py-2 px-4">https://api.agentotp.com</td>
              <td className="py-2 px-4">API base URL</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">timeout</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">number</td>
              <td className="py-2 px-4">30000</td>
              <td className="py-2 px-4">Request timeout in milliseconds</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">retries</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">number</td>
              <td className="py-2 px-4">3</td>
              <td className="py-2 px-4">Number of retry attempts</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">debug</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">boolean</td>
              <td className="py-2 px-4">false</td>
              <td className="py-2 px-4">Enable debug logging</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Full Example</h3>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
  baseUrl: 'https://api.agentotp.com',
  timeout: 30000,
  retries: 3,
  debug: process.env.NODE_ENV === 'development',
});`}</code>
      </pre>

      <h2>Self-Hosted Configuration</h2>

      <p>
        If you&apos;re running a self-hosted Agent OTP instance, configure the
        base URL to point to your server:
      </p>

      <pre className="language-typescript">
        <code>{`const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
  baseUrl: 'https://otp.your-company.com',
});`}</code>
      </pre>

      <p>
        See the{' '}
        <Link href="/docs/guides/self-hosting" className="text-primary hover:underline">
          Self-Hosting Guide
        </Link>{' '}
        for deployment instructions.
      </p>

      <h2>Multiple Environments</h2>

      <p>
        Use different API keys for development, staging, and production:
      </p>

      <pre className="language-typescript">
        <code>{`// lib/otp.ts
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const apiKeys = {
  development: process.env.AGENT_OTP_DEV_KEY,
  staging: process.env.AGENT_OTP_STAGING_KEY,
  production: process.env.AGENT_OTP_API_KEY,
};

const env = process.env.NODE_ENV || 'development';

export const otp = new AgentOTPClient({
  apiKey: apiKeys[env as keyof typeof apiKeys]!,
});`}</code>
      </pre>

      <h2>Next Steps</h2>

      <ul>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Follow the Quick Start guide
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/how-it-works" className="text-primary hover:underline">
            Learn how Agent OTP works
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            Explore the SDK reference
          </Link>
        </li>
      </ul>
    </article>
  );
}
