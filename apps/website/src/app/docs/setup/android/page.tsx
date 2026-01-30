import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Android Setup',
  description: 'Set up the Agent OTP Android app to capture SMS verification codes for your AI agents.',
};

export default function AndroidSetupPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Android Setup Guide</h1>

      <p className="lead text-xl text-muted-foreground">
        Set up the Agent OTP Android app to capture SMS verification codes and
        relay them securely to your AI agents.
      </p>

      <div className="not-prose my-8 rounded-lg border border-amber-500/50 bg-amber-500/10 p-6">
        <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
          Coming Soon
        </h3>
        <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
          The Android app is currently in development. This page will be updated
          with installation instructions once the app is available.
        </p>
      </div>

      <h2>Overview</h2>

      <p>
        The Agent OTP Android app runs on your Android device and captures SMS
        verification codes. When an OTP matching your agent&apos;s request arrives,
        the app:
      </p>

      <ol>
        <li>Detects the incoming SMS</li>
        <li>Extracts the verification code</li>
        <li>Encrypts it with your agent&apos;s public key</li>
        <li>Sends the encrypted payload to Agent OTP servers</li>
      </ol>

      <h2>Requirements</h2>

      <ul>
        <li>Android 8.0 (Oreo) or later</li>
        <li>SMS permissions granted to the app</li>
        <li>Internet connectivity</li>
        <li>Agent OTP account (self-hosted or cloud)</li>
      </ul>

      <h2>Planned Features</h2>

      <ul>
        <li>Automatic OTP detection and extraction</li>
        <li>Pattern-based sender filtering</li>
        <li>Battery-efficient background operation</li>
        <li>Local encryption before transmission</li>
        <li>Notification when OTP is captured</li>
        <li>Multiple device support</li>
        <li>Offline queueing</li>
      </ul>

      <h2>Privacy & Security</h2>

      <p>The app is designed with privacy in mind:</p>

      <ul>
        <li>
          <strong>Selective capture</strong> - Only captures OTPs matching your
          approved requests
        </li>
        <li>
          <strong>End-to-end encryption</strong> - OTPs are encrypted before
          leaving your device
        </li>
        <li>
          <strong>No message storage</strong> - Messages are not stored on the
          device after processing
        </li>
        <li>
          <strong>Open source</strong> - Full source code available for audit
        </li>
      </ul>

      <h2>Alternative: Testing Without the App</h2>

      <p>
        While the Android app is in development, you can test Agent OTP using
        email capture or by manually forwarding OTPs through the web interface.
      </p>

      <ul>
        <li>
          <Link href="/docs/setup/email" className="text-primary hover:underline">
            Set up email capture →
          </Link>
        </li>
      </ul>

      <h2>Stay Updated</h2>

      <p>
        To be notified when the Android app is available:
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
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            How Encryption Works
          </Link>
        </li>
      </ul>
    </article>
  );
}
