import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Quick Start',
  description: 'Get up and running with Agent OTP in minutes. Learn how to install the SDK, set up OTP capture, and request verification codes.',
};

export default function QuickStartPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Quick Start</h1>

      <p className="lead text-xl text-muted-foreground">
        Get up and running with Agent OTP in minutes. This guide will walk you
        through installation, setup, and requesting your first OTP.
      </p>

      <h2>Prerequisites</h2>

      <ul>
        <li>Node.js 18+ or Bun 1.0+</li>
        <li>An Agent OTP API key (self-hosted or from agentotp.com)</li>
        <li>An AI agent or application that needs OTP verification</li>
      </ul>

      <h2>Step 1: Install the SDK</h2>

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

      <h2>Step 2: Initialize the Client</h2>

      <p>
        Create an Agent OTP client with your API key. We recommend using
        environment variables:
      </p>

      <pre className="language-typescript">
        <code>{`// lib/otp.ts
import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

export const otpClient = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
  // For self-hosted deployments:
  // baseUrl: 'https://otp.your-domain.com',
});`}</code>
      </pre>

      <h2>Step 3: Generate Encryption Keys</h2>

      <p>
        Agent OTP uses end-to-end encryption. Generate a key pair for your agent
        and store the private key securely:
      </p>

      <pre className="language-typescript">
        <code>{`import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
} from '@orrisai/agent-otp-sdk';

// Generate keys (do this once, store securely)
const { publicKey, privateKey } = await generateKeyPair();

// Export for storage
const publicKeyBase64 = await exportPublicKey(publicKey);
const privateKeyBase64 = await exportPrivateKey(privateKey);

// Store privateKeyBase64 securely (e.g., environment variable, secrets manager)
console.log('Public Key:', publicKeyBase64);
console.log('Private Key:', privateKeyBase64); // Keep this secret!`}</code>
      </pre>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Important:</strong> Store your private key securely. Never commit
          it to source control. Use environment variables or a secrets manager.
        </p>
      </div>

      <h2>Step 4: Request an OTP</h2>

      <p>
        Now you can request OTPs for verification. Here&apos;s a complete example:
      </p>

      <pre className="language-typescript">
        <code>{`import { otpClient } from './lib/otp';
import { importPrivateKey, exportPublicKey } from '@orrisai/agent-otp-sdk';

async function signUpForService(email: string) {
  // Load your keys (in production, load from secure storage)
  const privateKey = await importPrivateKey(process.env.AGENT_PRIVATE_KEY!);
  const publicKeyBase64 = process.env.AGENT_PUBLIC_KEY!;

  // Request an OTP
  const request = await otpClient.requestOTP({
    reason: 'Sign up verification for Acme Inc',
    expectedSender: 'Acme',
    filter: {
      sources: ['email'],
      senderPattern: '*@acme.com',
    },
    publicKey: publicKeyBase64,
    waitForOTP: true,
    timeout: 120000, // Wait up to 2 minutes
    onPendingApproval: (info) => {
      console.log('Please approve at:', info.approvalUrl);
    },
  });

  // Check the result
  if (request.status === 'otp_received') {
    // Consume and decrypt the OTP
    const { code, metadata } = await otpClient.consumeOTP(request.id, privateKey);

    console.log('OTP code:', code);
    console.log('From:', metadata?.sender);

    // Use the code to complete sign up
    return { success: true, code };
  } else if (request.status === 'denied') {
    console.log('User denied the request');
    return { success: false, error: 'denied' };
  } else if (request.status === 'expired') {
    console.log('Request expired');
    return { success: false, error: 'expired' };
  }

  return { success: false, error: request.status };
}`}</code>
      </pre>

      <h2>Step 5: Set Up OTP Capture (Optional)</h2>

      <p>
        To capture OTPs, you need to set up one of the capture methods:
      </p>

      <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">SMS (Android)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Install the Agent OTP Android app to capture SMS verification codes.
          </p>
          <Link
            href="/docs/setup/android"
            className="text-sm text-primary hover:underline"
          >
            Android Setup Guide →
          </Link>
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="font-semibold mb-2">Email (Gmail/IMAP)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Connect your email to capture verification codes from your inbox.
          </p>
          <Link
            href="/docs/setup/email"
            className="text-sm text-primary hover:underline"
          >
            Email Setup Guide →
          </Link>
        </div>
      </div>

      <h2>Understanding Request Status</h2>

      <p>OTP requests go through several states:</p>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Status</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">pending_approval</td>
              <td className="py-2 px-4">Waiting for user to approve the request</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">approved</td>
              <td className="py-2 px-4">Approved, waiting for OTP to arrive</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">otp_received</td>
              <td className="py-2 px-4">OTP captured and ready to consume</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">consumed</td>
              <td className="py-2 px-4">OTP has been read (one-time use)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">denied</td>
              <td className="py-2 px-4">User denied the request</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">expired</td>
              <td className="py-2 px-4">Request expired before completion</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Next Steps</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/how-it-works" className="text-primary hover:underline">
            Learn how Agent OTP works in depth
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            Understand the encryption model
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            Explore the full SDK reference
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/self-hosting" className="text-primary hover:underline">
            Self-host Agent OTP
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
            href="https://github.com/anthropics/agent-otp/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub Issues
          </a>
          <a
            href="https://github.com/anthropics/agent-otp/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub Discussions
          </a>
        </div>
      </div>
    </article>
  );
}
