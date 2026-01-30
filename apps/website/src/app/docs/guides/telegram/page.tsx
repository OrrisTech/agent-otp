import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Telegram Bot Setup',
  description: 'Set up the Agent OTP Telegram bot for real-time permission approval notifications.',
};

export default function TelegramSetupPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Telegram Bot Setup</h1>

      <p className="lead text-xl text-muted-foreground">
        Receive instant permission approval requests on Telegram. Approve or
        deny agent actions from anywhere.
      </p>

      <h2>Overview</h2>

      <p>
        The Agent OTP Telegram bot sends you notifications when your AI agents
        request permissions that need human approval. You can approve or deny
        requests directly from Telegram.
      </p>

      <h2>Setup Instructions</h2>

      <h3>Step 1: Start the Bot</h3>

      <ol>
        <li>
          Open Telegram and search for{' '}
          <code>@AgentOTPBot</code>
        </li>
        <li>
          Click <strong>Start</strong> to begin the conversation
        </li>
        <li>
          The bot will greet you with a welcome message
        </li>
      </ol>

      <h3>Step 2: Link Your Account</h3>

      <ol>
        <li>
          Go to your{' '}
          <Link href="/dashboard/settings" className="text-primary hover:underline">
            Agent OTP Dashboard Settings
          </Link>
        </li>
        <li>
          Navigate to <strong>Notifications → Telegram</strong>
        </li>
        <li>
          Click <strong>Link Telegram Account</strong>
        </li>
        <li>
          Copy the link code shown
        </li>
        <li>
          Send the code to the Telegram bot: <code>/link YOUR_CODE</code>
        </li>
      </ol>

      <div className="not-prose my-4 rounded-lg border border-green-500/50 bg-green-500/10 p-4">
        <p className="text-sm text-green-700 dark:text-green-400">
          Once linked, you&apos;ll see a confirmation message in both Telegram
          and your dashboard.
        </p>
      </div>

      <h3>Step 3: Test the Connection</h3>

      <ol>
        <li>
          In the dashboard, click <strong>Send Test Notification</strong>
        </li>
        <li>
          You should receive a test message in Telegram within seconds
        </li>
      </ol>

      <h2>Receiving Approval Requests</h2>

      <p>
        When an agent requests a permission that needs approval, you&apos;ll
        receive a message like this:
      </p>

      <pre className="language-text">
        <code>{`🔐 Permission Request

Agent: invoice-bot
Action: email.send
To: client@example.com
Subject: Invoice #12345
Reason: Sending monthly invoice to client

Requested scope:
• Max emails: 1
• Attachment: Yes (invoice.pdf)

Expires in: 4:32

[✅ Approve]  [❌ Deny]  [ℹ️ Details]`}</code>
      </pre>

      <h3>Available Actions</h3>

      <ul>
        <li>
          <strong>Approve</strong> - Grant the permission and issue a token
        </li>
        <li>
          <strong>Deny</strong> - Reject the request with an optional reason
        </li>
        <li>
          <strong>Details</strong> - See full request context and scope
        </li>
      </ul>

      <h2>Bot Commands</h2>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Command</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/start</td>
              <td className="py-2 px-4">Start the bot and see welcome message</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/link CODE</td>
              <td className="py-2 px-4">Link your Agent OTP account</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/unlink</td>
              <td className="py-2 px-4">Unlink your account</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/pending</td>
              <td className="py-2 px-4">List pending approval requests</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/agents</td>
              <td className="py-2 px-4">List your registered agents</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/stats</td>
              <td className="py-2 px-4">View approval statistics</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">/settings</td>
              <td className="py-2 px-4">Configure notification preferences</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">/help</td>
              <td className="py-2 px-4">Show help message</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Notification Settings</h2>

      <p>
        Configure which notifications you receive:
      </p>

      <pre className="language-text">
        <code>{`/settings

📱 Notification Settings

• All requests: ✅ Enabled
• Auto-approved: ❌ Disabled
• Denied by policy: ❌ Disabled
• Token used: ❌ Disabled
• Token expired: ✅ Enabled

• Quiet hours: 10 PM - 7 AM
• Timezone: America/New_York

[Edit Settings]`}</code>
      </pre>

      <h3>Quiet Hours</h3>

      <p>
        During quiet hours, notifications are batched and delivered when quiet
        hours end. Urgent requests (expiring soon) will still notify immediately.
      </p>

      <h2>Quick Replies</h2>

      <p>
        Use quick replies for faster decisions:
      </p>

      <ul>
        <li>
          <code>/approve PERM_ID</code> - Approve a specific request
        </li>
        <li>
          <code>/deny PERM_ID reason</code> - Deny with a reason
        </li>
        <li>
          <code>/approve-all AGENT</code> - Approve all pending for an agent
        </li>
      </ul>

      <h2>Group Notifications</h2>

      <p>
        For team settings, add the bot to a Telegram group:
      </p>

      <ol>
        <li>
          Add <code>@AgentOTPBot</code> to your team group
        </li>
        <li>
          Link the group in dashboard settings
        </li>
        <li>
          Configure which team members can approve requests
        </li>
      </ol>

      <div className="not-prose my-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Note:</strong> In groups, only team members with approval
          permissions can use the approve/deny buttons.
        </p>
      </div>

      <h2>Troubleshooting</h2>

      <h3>Not Receiving Notifications</h3>

      <ol>
        <li>
          Check that your account is linked: <code>/status</code>
        </li>
        <li>
          Verify notifications are enabled in dashboard settings
        </li>
        <li>
          Check quiet hours settings
        </li>
        <li>
          Ensure Telegram notifications are not muted
        </li>
      </ol>

      <h3>Link Code Not Working</h3>

      <ul>
        <li>Link codes expire after 5 minutes - generate a new one</li>
        <li>Make sure you&apos;re typing the exact code shown</li>
        <li>Check for extra spaces before/after the code</li>
      </ul>

      <h3>Buttons Not Responding</h3>

      <ul>
        <li>The request may have expired - check the expiry time</li>
        <li>Someone else may have already responded (in groups)</li>
        <li>Try using the command: <code>/approve PERM_ID</code></li>
      </ul>

      <h2>Security Considerations</h2>

      <ul>
        <li>
          <strong>Keep your Telegram account secure</strong> - Enable two-factor
          authentication
        </li>
        <li>
          <strong>Don&apos;t share screenshots</strong> - They may contain
          sensitive request details
        </li>
        <li>
          <strong>Review requests carefully</strong> - Check the scope and
          context before approving
        </li>
        <li>
          <strong>Use groups wisely</strong> - Only add trusted team members
        </li>
      </ul>

      <h2>Alternative Notification Channels</h2>

      <p>
        Besides Telegram, you can also receive notifications via:
      </p>

      <ul>
        <li>
          <strong>Email</strong> - Good for async approval workflows
        </li>
        <li>
          <strong>Slack</strong> - For team-based approvals
        </li>
        <li>
          <strong>Web Dashboard</strong> - Real-time in-browser notifications
        </li>
        <li>
          <strong>Webhooks</strong> - For custom integrations
        </li>
      </ul>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Quick Start Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/permissions" className="text-primary hover:underline">
            Understanding Permissions
          </Link>
        </li>
        <li>
          <Link href="/docs/guides/policies" className="text-primary hover:underline">
            Policy Best Practices
          </Link>
        </li>
      </ul>
    </article>
  );
}
