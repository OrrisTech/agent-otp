import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Learn how to integrate Agent OTP into your AI agent applications for secure, scoped, and human-approved permissions.',
};

export default function DocsPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Introduction to Agent OTP</h1>

      <p className="lead text-xl text-muted-foreground">
        Agent OTP is a lightweight service that provides one-time, scoped permissions
        for AI agents. It enables human-in-the-loop approval workflows for sensitive
        operations while allowing safe operations to be auto-approved.
      </p>

      <h2>Why Agent OTP?</h2>

      <p>
        As AI agents become more autonomous and capable, they need access to sensitive
        resources like email, databases, financial systems, and more. Traditional
        authentication methods (API keys, OAuth tokens) grant broad, persistent access
        that doesn&apos;t match the ephemeral, scoped nature of agent operations.
      </p>

      <p>Agent OTP solves this by providing:</p>

      <ul>
        <li>
          <strong>Scoped permissions</strong> - Define exactly what an agent can do
          with each request
        </li>
        <li>
          <strong>Ephemeral tokens</strong> - Tokens expire after use or timeout,
          eliminating persistent credential risks
        </li>
        <li>
          <strong>Human-in-the-loop</strong> - Configure policies to require human
          approval for sensitive operations
        </li>
        <li>
          <strong>Full audit trail</strong> - Every request, approval, and usage
          is logged for compliance
        </li>
      </ul>

      <h2>How it works</h2>

      <div className="not-prose my-8 rounded-lg border border-border bg-muted/30 p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              1
            </div>
            <h3 className="font-semibold mb-1">Request</h3>
            <p className="text-sm text-muted-foreground">
              Agent requests permission for a specific action
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              2
            </div>
            <h3 className="font-semibold mb-1">Evaluate</h3>
            <p className="text-sm text-muted-foreground">
              Policy engine determines if approval is needed
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              3
            </div>
            <h3 className="font-semibold mb-1">Approve</h3>
            <p className="text-sm text-muted-foreground">
              Auto-approve or send to human for review
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              4
            </div>
            <h3 className="font-semibold mb-1">Execute</h3>
            <p className="text-sm text-muted-foreground">
              Agent uses one-time token to perform action
            </p>
          </div>
        </div>
      </div>

      <h2>Quick example</h2>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_KEY,
});

// Request permission to send an email
const permission = await otp.requestPermission({
  action: 'gmail.send',
  resource: 'email:client@example.com',
  scope: {
    max_emails: 1,
  },
  context: {
    reason: 'Sending invoice to client',
  },
  waitForApproval: true,
});

if (permission.status === 'approved') {
  // Token is scoped to exactly this operation
  await sendEmail({
    to: 'client@example.com',
    otpToken: permission.token,
  });
}`}</code>
      </pre>

      <h2>Key features</h2>

      <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Policy Engine</h3>
          <p className="text-sm text-muted-foreground">
            Define rules to auto-approve safe operations and require human
            review for risky ones.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Multi-channel Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get approval requests via Telegram, email, webhooks, or the web
            dashboard.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Framework Agnostic</h3>
          <p className="text-sm text-muted-foreground">
            Works with LangChain, CrewAI, AutoGen, or any custom agent
            framework.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Audit & Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Full audit trail of all permissions, approvals, and usage for
            compliance needs.
          </p>
        </div>
      </div>

      <h2>Next steps</h2>

      <div className="not-prose flex flex-col sm:flex-row gap-4 mt-6">
        <Button asChild>
          <Link href="/docs/quickstart">
            Quick Start Guide
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/docs/concepts/permissions">
            Learn Core Concepts
          </Link>
        </Button>
      </div>
    </article>
  );
}
