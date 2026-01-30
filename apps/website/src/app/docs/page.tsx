import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Learn how to integrate Agent OTP into your AI agent applications for secure OTP relay with end-to-end encryption.',
};

export default function DocsPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Introduction to Agent OTP</h1>

      <p className="lead text-xl text-muted-foreground">
        Agent OTP is a secure relay service that helps AI agents receive verification
        codes (SMS/email OTPs) with end-to-end encryption, user approval, and
        automatic deletion after use.
      </p>

      <h2>Why Agent OTP?</h2>

      <p>
        AI agents often need to complete tasks that require verification codes -
        signing up for services, logging into accounts, or verifying identity.
        However, giving agents direct access to your SMS or email creates security
        risks. Agent OTP solves this by acting as a secure relay.
      </p>

      <p>Agent OTP provides:</p>

      <ul>
        <li>
          <strong>End-to-End Encryption</strong> - OTPs are encrypted on capture;
          only your agent can decrypt them using its private key
        </li>
        <li>
          <strong>User Approval</strong> - You control which OTPs agents can access,
          approving each request individually
        </li>
        <li>
          <strong>One-Time Read</strong> - OTPs are automatically deleted after
          consumption, eliminating persistent data risks
        </li>
        <li>
          <strong>Full Audit Trail</strong> - Every OTP request and access is
          logged for compliance and transparency
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
              Agent requests an OTP with its public encryption key
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              2
            </div>
            <h3 className="font-semibold mb-1">Approve</h3>
            <p className="text-sm text-muted-foreground">
              User reviews and approves the OTP request
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              3
            </div>
            <h3 className="font-semibold mb-1">Capture</h3>
            <p className="text-sm text-muted-foreground">
              OTP is captured (SMS/email) and encrypted
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold mb-3">
              4
            </div>
            <h3 className="font-semibold mb-1">Consume</h3>
            <p className="text-sm text-muted-foreground">
              Agent decrypts and uses OTP; it&apos;s then deleted
            </p>
          </div>
        </div>
      </div>

      <h2>Quick example</h2>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey
} from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY,
});

// Generate encryption keys (store private key securely)
const { publicKey, privateKey } = await generateKeyPair();

// Request an OTP
const request = await client.requestOTP({
  reason: 'Sign up for Acme service',
  expectedSender: 'Acme',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,
  timeout: 120000,
});

// Consume the OTP (decrypts and deletes from server)
if (request.status === 'otp_received') {
  const { code, metadata } = await client.consumeOTP(request.id, privateKey);
  console.log('OTP code:', code);
}`}</code>
      </pre>

      <h2>Key features</h2>

      <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">E2E Encryption</h3>
          <p className="text-sm text-muted-foreground">
            OTPs are encrypted with your agent&apos;s public key. The relay
            service never sees the plaintext code.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Multi-Source Capture</h3>
          <p className="text-sm text-muted-foreground">
            Capture OTPs from SMS (Android app) or email (Gmail/IMAP integration).
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Framework Agnostic</h3>
          <p className="text-sm text-muted-foreground">
            Works with LangChain, CrewAI, AutoGen, or any custom agent framework.
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Self-Hostable</h3>
          <p className="text-sm text-muted-foreground">
            Open source and fully self-hostable. Run on your own infrastructure
            for complete control.
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
          <Link href="/docs/concepts/how-it-works">
            Learn How It Works
          </Link>
        </Button>
      </div>
    </article>
  );
}
