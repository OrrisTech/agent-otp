import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Quick Start',
  description: 'Get up and running with Agent OTP in 5 minutes. Learn how to install the SDK, configure your first agent, and request permissions.',
};

export default function QuickStartPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Quick Start</h1>

      <p className="lead text-xl text-muted-foreground">
        Get up and running with Agent OTP in under 5 minutes. This guide will walk
        you through installation, configuration, and your first permission request.
      </p>

      <h2>Prerequisites</h2>

      <ul>
        <li>Node.js 18+ or Bun 1.0+</li>
        <li>An Agent OTP account (free tier available)</li>
        <li>An existing AI agent or application</li>
      </ul>

      <h2>Step 1: Create an account</h2>

      <p>
        Sign up for a free account at{' '}
        <Link href="/signup" className="text-primary hover:underline">
          agentotp.com/signup
        </Link>
        . You&apos;ll get access to:
      </p>

      <ul>
        <li>1 agent</li>
        <li>100 requests per month</li>
        <li>Basic policies</li>
        <li>Email notifications</li>
      </ul>

      <h2>Step 2: Create an agent</h2>

      <p>
        In the dashboard, navigate to <strong>Agents</strong> and click{' '}
        <strong>Create Agent</strong>. Give your agent a descriptive name and
        save. You&apos;ll receive an API key that looks like:
      </p>

      <pre className="language-text">
        <code>ak_live_xxxxxxxxxxxxxxxxxxxx</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Important:</strong> Save this API key securely. It will only be
          shown once and cannot be retrieved later.
        </p>
      </div>

      <h2>Step 3: Install the SDK</h2>

      <p>Install the Agent OTP SDK in your project:</p>

      <div className="not-prose my-4 space-y-2">
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b border-border text-sm font-medium">
            npm
          </div>
          <pre className="m-0 rounded-none border-0">
            <code>npm install @orrisai/agent-otp-sdk</code>
          </pre>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b border-border text-sm font-medium">
            bun
          </div>
          <pre className="m-0 rounded-none border-0">
            <code>bun add @orrisai/agent-otp-sdk</code>
          </pre>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="px-4 py-2 bg-muted/50 border-b border-border text-sm font-medium">
            pnpm
          </div>
          <pre className="m-0 rounded-none border-0">
            <code>pnpm add @orrisai/agent-otp-sdk</code>
          </pre>
        </div>
      </div>

      <h2>Step 4: Configure the client</h2>

      <p>
        Initialize the Agent OTP client with your API key. We recommend using
        environment variables:
      </p>

      <pre className="language-typescript">
        <code>{`// lib/otp.ts
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

export const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_KEY!,
  // Optional: for self-hosted deployments
  // baseUrl: 'https://your-instance.com',
});`}</code>
      </pre>

      <h2>Step 5: Request your first permission</h2>

      <p>
        Now you can request permissions for sensitive operations. Here&apos;s a
        complete example:
      </p>

      <pre className="language-typescript">
        <code>{`import { otp } from './lib/otp';

async function sendInvoiceEmail(clientEmail: string, invoiceId: string) {
  // Request permission to send an email
  const permission = await otp.requestPermission({
    action: 'email.send',
    resource: \`email:\${clientEmail}\`,
    scope: {
      max_emails: 1,
      allowed_recipients: [clientEmail],
    },
    context: {
      reason: \`Sending invoice #\${invoiceId} to client\`,
      invoiceId,
    },
    waitForApproval: true, // Blocks until approved/denied
    timeout: 60000, // 60 second timeout
  });

  // Check the result
  if (permission.status === 'approved') {
    console.log('Permission granted! Token:', permission.token);

    // Use the token to send the email
    // The token is scoped to exactly this operation
    await yourEmailService.send({
      to: clientEmail,
      subject: \`Invoice #\${invoiceId}\`,
      // Pass the OTP token for verification
      otpToken: permission.token,
    });

    // Mark the token as used
    await otp.useToken(permission.token, {
      recipient: clientEmail,
      invoiceId,
    });

    return { success: true };
  } else if (permission.status === 'denied') {
    console.log('Permission denied:', permission.reason);
    return { success: false, error: 'Permission denied' };
  } else {
    console.log('Permission timed out');
    return { success: false, error: 'Approval timeout' };
  }
}`}</code>
      </pre>

      <h2>Step 6: Configure policies (optional)</h2>

      <p>
        By default, all permission requests require human approval. You can
        configure policies to auto-approve safe operations:
      </p>

      <pre className="language-yaml">
        <code>{`# Auto-approve file reads under 1MB
- name: "Auto-approve small file reads"
  conditions:
    action:
      equals: "file.read"
    scope.max_size:
      less_than: 1048576
  action: auto_approve

# Require approval for any financial operation
- name: "Financial operations"
  conditions:
    action:
      starts_with: "bank."
  action: require_approval
  priority: 100`}</code>
      </pre>

      <p>
        See the{' '}
        <Link href="/docs/concepts/policies" className="text-primary hover:underline">
          Policies documentation
        </Link>{' '}
        for more details.
      </p>

      <h2>Next steps</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/permissions" className="text-primary hover:underline">
            Understand permissions and scopes
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/telegram" className="text-primary hover:underline">
            Set up Telegram notifications
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            Explore the full SDK reference
          </Link>
        </li>
        <li>
          <Link href="/docs/integrations/langchain" className="text-primary hover:underline">
            Integrate with LangChain
          </Link>
        </li>
      </ul>

      <div className="not-prose mt-8 rounded-lg border border-border bg-muted/30 p-6">
        <h3 className="font-semibold mb-2">Need help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          If you run into any issues, we&apos;re here to help:
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <a
            href="https://github.com/yourusername/agent-otp/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub Issues
          </a>
          <a
            href="https://discord.gg/agentotp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Discord Community
          </a>
          <a href="mailto:support@agentotp.com" className="text-primary hover:underline">
            Email Support
          </a>
        </div>
      </div>
    </article>
  );
}
