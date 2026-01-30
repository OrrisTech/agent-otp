import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how Agent OTP securely relays verification codes to AI agents with end-to-end encryption and user approval.',
};

export default function HowItWorksPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>How Agent OTP Works</h1>

      <p className="lead text-xl text-muted-foreground">
        Agent OTP acts as a secure relay between your verification codes and your
        AI agents. Here&apos;s how the system ensures security and user control.
      </p>

      <h2>The Problem</h2>

      <p>
        AI agents often need to complete tasks that require verification codes:
      </p>

      <ul>
        <li>Signing up for services on behalf of users</li>
        <li>Logging into accounts that require 2FA</li>
        <li>Verifying identity for financial transactions</li>
        <li>Confirming actions that require human verification</li>
      </ul>

      <p>
        The naive solution - giving agents direct access to SMS or email - creates
        significant security risks:
      </p>

      <ul>
        <li>Agents could read sensitive personal messages</li>
        <li>Broad access is hard to audit or control</li>
        <li>Compromised agents could abuse access</li>
        <li>No separation between different OTP sources</li>
      </ul>

      <h2>The Solution: Secure OTP Relay</h2>

      <p>
        Agent OTP solves this by acting as a controlled intermediary. The agent
        never has direct access to your messages - instead, specific OTPs are
        securely relayed only when you approve.
      </p>

      <h2>Request Flow</h2>

      <div className="not-prose my-8 rounded-lg border border-border bg-muted/30 p-6">
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="font-semibold mb-1">Agent Requests OTP</h3>
              <p className="text-sm text-muted-foreground">
                The agent sends a request to Agent OTP, specifying why it needs the
                OTP, the expected sender (e.g., &quot;GitHub&quot;), and its public encryption key.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-semibold mb-1">User Reviews and Approves</h3>
              <p className="text-sm text-muted-foreground">
                You receive a notification (mobile app, email, or web) showing what
                the agent is requesting. You can approve or deny the request.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              3
            </div>
            <div>
              <h3 className="font-semibold mb-1">OTP is Captured</h3>
              <p className="text-sm text-muted-foreground">
                When the OTP arrives (via SMS or email), Agent OTP captures it based
                on the filters you approved (sender, content pattern).
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              4
            </div>
            <div>
              <h3 className="font-semibold mb-1">OTP is Encrypted</h3>
              <p className="text-sm text-muted-foreground">
                The OTP code is immediately encrypted using the agent&apos;s public key.
                Even Agent OTP servers cannot read the plaintext code.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
              5
            </div>
            <div>
              <h3 className="font-semibold mb-1">Agent Consumes OTP</h3>
              <p className="text-sm text-muted-foreground">
                The agent retrieves and decrypts the OTP using its private key. The
                encrypted payload is immediately deleted from Agent OTP servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2>Security Principles</h2>

      <h3>End-to-End Encryption</h3>

      <p>
        OTPs are encrypted on capture using the agent&apos;s public key. The relay
        service only ever sees encrypted data - it cannot read your verification
        codes. Only the agent with the corresponding private key can decrypt them.
      </p>

      <h3>User Approval Required</h3>

      <p>
        Every OTP request requires explicit user approval. You see exactly what
        the agent is requesting and why. You can deny requests you don&apos;t recognize
        or trust.
      </p>

      <h3>One-Time Read</h3>

      <p>
        Once an agent consumes an OTP, the encrypted payload is permanently
        deleted. There&apos;s no way to re-read the same OTP. This prevents data
        accumulation and limits exposure.
      </p>

      <h3>Scoped Capture</h3>

      <p>
        Each request specifies filters for what OTPs to capture. The agent only
        receives OTPs matching the approved criteria - not all your messages.
      </p>

      <h3>Full Audit Trail</h3>

      <p>
        Every request, approval, denial, and consumption is logged. You can
        review what OTPs agents have accessed and when.
      </p>

      <h2>Request Statuses</h2>

      <p>OTP requests progress through these states:</p>

      <div className="not-prose my-4">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            pending_approval
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400">
            approved
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
            otp_received
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-1 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-400">
            consumed
          </span>
        </div>
      </div>

      <p>Alternative terminal states:</p>

      <ul>
        <li><code>denied</code> - User denied the request</li>
        <li><code>expired</code> - Request timed out</li>
        <li><code>cancelled</code> - Agent cancelled the request</li>
      </ul>

      <h2>What Agent OTP Does NOT Do</h2>

      <ul>
        <li>
          <strong>Store your messages</strong> - Only encrypted OTP payloads are
          temporarily stored until consumed
        </li>
        <li>
          <strong>Read your OTPs</strong> - End-to-end encryption means only your
          agent can decrypt the codes
        </li>
        <li>
          <strong>Access without approval</strong> - Every request requires
          explicit user approval
        </li>
        <li>
          <strong>Keep historical data</strong> - OTPs are deleted immediately
          after consumption
        </li>
      </ul>

      <h2>Next Steps</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            Learn about the encryption model
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/sources" className="text-primary hover:underline">
            Understand OTP capture sources
          </Link>
        </li>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Get started with the SDK
          </Link>
        </li>
      </ul>
    </article>
  );
}
