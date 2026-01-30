import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Installation',
  description: 'Install Agent OTP SDK in your project. Supports npm, yarn, pnpm, and bun package managers.',
};

export default function InstallationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Installation</h1>

      <p className="lead text-xl text-muted-foreground">
        Install the Agent OTP SDK in your project using your preferred package manager.
      </p>

      <h2>Requirements</h2>

      <ul>
        <li>Node.js 18.0 or later</li>
        <li>TypeScript 5.0 or later (recommended)</li>
      </ul>

      <h2>Package Managers</h2>

      <h3>npm</h3>

      <pre className="language-bash">
        <code>npm install @orrisai/agent-otp-sdk</code>
      </pre>

      <h3>yarn</h3>

      <pre className="language-bash">
        <code>yarn add @orrisai/agent-otp-sdk</code>
      </pre>

      <h3>pnpm</h3>

      <pre className="language-bash">
        <code>pnpm add @orrisai/agent-otp-sdk</code>
      </pre>

      <h3>bun</h3>

      <pre className="language-bash">
        <code>bun add @orrisai/agent-otp-sdk</code>
      </pre>

      <h2>Python SDK</h2>

      <p>
        For Python projects, install the Python SDK using pip:
      </p>

      <pre className="language-bash">
        <code>pip install agent-otp</code>
      </pre>

      <p>
        See the{' '}
        <Link href="/docs/sdk/python" className="text-primary hover:underline">
          Python SDK documentation
        </Link>{' '}
        for more details.
      </p>

      <h2>Peer Dependencies</h2>

      <p>
        The TypeScript SDK has no required peer dependencies. It works in both
        Node.js and browser environments.
      </p>

      <h2>TypeScript Configuration</h2>

      <p>
        If you&apos;re using TypeScript, ensure your <code>tsconfig.json</code>{' '}
        includes the following settings for optimal type inference:
      </p>

      <pre className="language-json">
        <code>{`{
  "compilerOptions": {
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true
  }
}`}</code>
      </pre>

      <h2>CDN Usage</h2>

      <p>
        For quick prototyping, you can load the SDK from a CDN:
      </p>

      <pre className="language-html">
        <code>{`<script type="module">
  import { AgentOTPClient } from 'https://esm.sh/@orrisai/agent-otp-sdk';

  const client = new AgentOTPClient({ apiKey: 'your-api-key' });
</script>`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Note:</strong> CDN usage is only recommended for development
          and prototyping. For production, always use a package manager.
        </p>
      </div>

      <h2>Verifying Installation</h2>

      <p>
        To verify the SDK is installed correctly, run this quick test:
      </p>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: 'test-key',
});

console.log('SDK installed successfully!');
console.log('Version:', client.version);`}</code>
      </pre>

      <h2>Next Steps</h2>

      <ul>
        <li>
          <Link href="/docs/configuration" className="text-primary hover:underline">
            Configure the SDK
          </Link>
        </li>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Follow the Quick Start guide
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            Explore the TypeScript SDK reference
          </Link>
        </li>
      </ul>
    </article>
  );
}
