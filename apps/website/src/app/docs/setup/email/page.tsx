import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Email Setup',
  description: 'Set up email integration (Gmail or IMAP) to capture email verification codes for your AI agents.',
};

export default function EmailSetupPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Email Setup Guide</h1>

      <p className="lead text-xl text-muted-foreground">
        Configure email integration to capture verification codes from your inbox
        and relay them securely to your AI agents.
      </p>

      <div className="not-prose my-8 rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
        <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
          Coming Soon
        </h3>
        <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
          Email integration is currently in development. This page will be updated
          with setup instructions once the feature is available.
        </p>
      </div>

      <h2>Overview</h2>

      <p>
        Agent OTP can capture verification codes from your email inbox using
        Gmail API or IMAP integration. When an email matching your agent&apos;s
        request arrives, the system:
      </p>

      <ol>
        <li>Detects the incoming email</li>
        <li>Extracts the verification code from the body</li>
        <li>Encrypts it with your agent&apos;s public key</li>
        <li>Makes it available for consumption</li>
      </ol>

      <h2>Integration Options</h2>

      <h3>Gmail API (Recommended for Gmail users)</h3>

      <p>
        Uses OAuth 2.0 for secure authentication with Google. Provides real-time
        push notifications for immediate OTP capture.
      </p>

      <ul>
        <li>Real-time push notifications</li>
        <li>Minimal latency</li>
        <li>Fine-grained permission scopes</li>
        <li>No password storage required</li>
      </ul>

      <h3>IMAP (Universal)</h3>

      <p>
        Works with any email provider that supports IMAP. Uses app passwords
        for authentication.
      </p>

      <ul>
        <li>Works with any email provider</li>
        <li>Self-hosted friendly</li>
        <li>Polling-based (configurable interval)</li>
        <li>Requires app password</li>
      </ul>

      <h2>Requirements</h2>

      <h3>Gmail API</h3>

      <ul>
        <li>Gmail account</li>
        <li>OAuth consent (one-time setup)</li>
        <li>Internet connectivity</li>
      </ul>

      <h3>IMAP</h3>

      <ul>
        <li>Email account with IMAP enabled</li>
        <li>App password (if 2FA enabled)</li>
        <li>IMAP server details</li>
      </ul>

      <h2>Planned Features</h2>

      <ul>
        <li>Gmail OAuth integration</li>
        <li>IMAP support for any provider</li>
        <li>Pattern-based email filtering</li>
        <li>Subject and sender matching</li>
        <li>Code extraction from email body</li>
        <li>Support for HTML emails</li>
        <li>Multiple email account support</li>
      </ul>

      <h2>Privacy & Security</h2>

      <p>Email integration is designed with privacy in mind:</p>

      <ul>
        <li>
          <strong>Minimal scope</strong> - Only reads emails matching your
          approved requests
        </li>
        <li>
          <strong>End-to-end encryption</strong> - OTPs are encrypted before storage
        </li>
        <li>
          <strong>No email storage</strong> - Full emails are not stored, only
          extracted codes
        </li>
        <li>
          <strong>Revocable access</strong> - Disconnect at any time from settings
        </li>
      </ul>

      <h2>Common Email Providers</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Provider</th>
              <th className="py-2 px-4 text-left font-semibold">Recommended Method</th>
              <th className="py-2 px-4 text-left font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Gmail</td>
              <td className="py-2 px-4">Gmail API</td>
              <td className="py-2 px-4">Best experience, real-time</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Outlook/Microsoft 365</td>
              <td className="py-2 px-4">IMAP</td>
              <td className="py-2 px-4">App password required</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Yahoo Mail</td>
              <td className="py-2 px-4">IMAP</td>
              <td className="py-2 px-4">App password required</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">ProtonMail</td>
              <td className="py-2 px-4">IMAP Bridge</td>
              <td className="py-2 px-4">Requires ProtonMail Bridge</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Self-hosted</td>
              <td className="py-2 px-4">IMAP</td>
              <td className="py-2 px-4">Direct IMAP access</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Stay Updated</h2>

      <p>
        To be notified when email integration is available:
      </p>

      <ul>
        <li>
          <a
            href="https://github.com/anthropics/agent-otp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Star the GitHub repo
          </a>
        </li>
        <li>
          <a
            href="https://github.com/anthropics/agent-otp/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Watch releases
          </a>
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/concepts/sources" className="text-primary hover:underline">
            OTP Capture Sources
          </Link>
        </li>
        <li>
          <Link href="/docs/setup/android" className="text-primary hover:underline">
            Android SMS Setup
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            How Encryption Works
          </Link>
        </li>
      </ul>
    </article>
  );
}
