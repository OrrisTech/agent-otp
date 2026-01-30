import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'OTP Sources',
  description: 'Learn about the different OTP capture sources supported by Agent OTP: SMS (Android), Email (Gmail/IMAP), and more.',
};

export default function SourcesPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>OTP Capture Sources</h1>

      <p className="lead text-xl text-muted-foreground">
        Agent OTP can capture verification codes from multiple sources. Each source
        has different setup requirements and capabilities.
      </p>

      <h2>Supported Sources</h2>

      <div className="not-prose my-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg m-0">SMS (Android)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Capture SMS verification codes using the Agent OTP Android app.
            Requires installing the app on your Android device.
          </p>
          <Link
            href="/docs/setup/android"
            className="text-sm text-primary hover:underline"
          >
            Setup Guide →
          </Link>
        </div>

        <div className="rounded-lg border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg m-0">Email</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Capture email verification codes via Gmail API or IMAP integration.
            Works with most email providers.
          </p>
          <Link
            href="/docs/setup/email"
            className="text-sm text-primary hover:underline"
          >
            Setup Guide →
          </Link>
        </div>

        <div className="rounded-lg border border-border border-dashed p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg m-0">WhatsApp</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Capture WhatsApp verification codes. Coming soon.
          </p>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>

        <div className="rounded-lg border border-border border-dashed p-6 opacity-60">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg m-0">iOS SMS</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Capture SMS on iOS devices. Exploring feasibility.
          </p>
          <span className="text-sm text-muted-foreground">Planned</span>
        </div>
      </div>

      <h2>Source Filtering</h2>

      <p>
        When requesting an OTP, you can specify which sources to accept and
        filter by sender:
      </p>

      <pre className="language-typescript">
        <code>{`const request = await client.requestOTP({
  reason: 'Sign up verification',
  expectedSender: 'GitHub',
  filter: {
    // Only accept from these sources
    sources: ['email', 'sms'],

    // Match sender pattern (wildcards supported)
    senderPattern: '*@github.com',

    // Match content pattern (optional)
    contentPattern: 'verification code',
  },
  publicKey: publicKeyBase64,
});`}</code>
      </pre>

      <h3>Filter Options</h3>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Option</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
              <th className="py-2 px-4 text-left font-semibold">Example</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">sources</td>
              <td className="py-2 px-4">Array of accepted sources</td>
              <td className="py-2 px-4 font-mono">[&apos;email&apos;, &apos;sms&apos;]</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">senderPattern</td>
              <td className="py-2 px-4">Wildcard pattern for sender</td>
              <td className="py-2 px-4 font-mono">*@google.com</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">contentPattern</td>
              <td className="py-2 px-4">Regex pattern for message content</td>
              <td className="py-2 px-4 font-mono">verification.*code</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>SMS (Android)</h2>

      <p>
        The Agent OTP Android app captures SMS verification codes and securely
        relays them to the service.
      </p>

      <h3>Features</h3>

      <ul>
        <li>Automatic OTP detection using pattern matching</li>
        <li>Runs in background with minimal battery impact</li>
        <li>Local encryption before sending to server</li>
        <li>Notification when OTP is captured</li>
      </ul>

      <h3>Limitations</h3>

      <ul>
        <li>Android only (iOS does not allow SMS access)</li>
        <li>Requires SMS permissions</li>
        <li>Some carriers may delay SMS delivery</li>
      </ul>

      <p>
        See the{' '}
        <Link href="/docs/setup/android" className="text-primary hover:underline">
          Android Setup Guide
        </Link>{' '}
        for installation instructions.
      </p>

      <h2>Email</h2>

      <p>
        Agent OTP can capture verification codes from email using Gmail API or
        IMAP integration.
      </p>

      <h3>Gmail API</h3>

      <ul>
        <li>OAuth-based authentication</li>
        <li>Real-time push notifications</li>
        <li>Fine-grained permission scopes</li>
        <li>Best for Gmail users</li>
      </ul>

      <h3>IMAP</h3>

      <ul>
        <li>Works with any email provider</li>
        <li>App password authentication</li>
        <li>Polling-based (slight delay)</li>
        <li>Self-hosted friendly</li>
      </ul>

      <p>
        See the{' '}
        <Link href="/docs/setup/email" className="text-primary hover:underline">
          Email Setup Guide
        </Link>{' '}
        for configuration instructions.
      </p>

      <h2>Choosing the Right Source</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Use Case</th>
              <th className="py-2 px-4 text-left font-semibold">Recommended Source</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Phone verification (most services)</td>
              <td className="py-2 px-4">SMS (Android)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Email verification</td>
              <td className="py-2 px-4">Email (Gmail/IMAP)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4">Two-factor authentication</td>
              <td className="py-2 px-4">SMS or Email (depends on 2FA setup)</td>
            </tr>
            <tr>
              <td className="py-2 px-4">Bank/financial verification</td>
              <td className="py-2 px-4">SMS (most banks use SMS)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/setup/android" className="text-primary hover:underline">
            Android Setup Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/setup/email" className="text-primary hover:underline">
            Email Setup Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/how-it-works" className="text-primary hover:underline">
            How Agent OTP Works
          </Link>
        </li>
      </ul>
    </article>
  );
}
