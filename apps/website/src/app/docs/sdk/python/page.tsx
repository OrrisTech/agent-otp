import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Python SDK',
  description: 'Complete reference for the Agent OTP Python SDK. Learn about the client API, types, and async support.',
};

export default function PythonSDKPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Python SDK Reference</h1>

      <p className="lead text-xl text-muted-foreground">
        The official Python SDK for Agent OTP. Full type hints, async support,
        and comprehensive error handling.
      </p>

      <div className="not-prose my-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Coming Soon:</strong> The Python SDK is currently in development.
          Join our{' '}
          <a href="https://discord.gg/agentotp" className="underline">
            Discord
          </a>{' '}
          to be notified when it&apos;s released.
        </p>
      </div>

      <h2>Installation</h2>

      <pre className="language-bash">
        <code>pip install agent-otp</code>
      </pre>

      <p>Or with poetry:</p>

      <pre className="language-bash">
        <code>poetry add agent-otp</code>
      </pre>

      <h2>Requirements</h2>

      <ul>
        <li>Python 3.9 or later</li>
        <li>Works with both sync and async code</li>
      </ul>

      <h2>Quick Start</h2>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient

# Initialize the client
client = AgentOTPClient(api_key="ak_live_xxxx")

# Request permission
permission = client.request_permission(
    action="email.send",
    resource="email:client@example.com",
    scope={
        "max_emails": 1,
        "allowed_recipients": ["client@example.com"],
    },
    context={
        "reason": "Sending monthly invoice",
    },
    wait_for_approval=True,
    timeout=60,
)

if permission.status == "approved":
    print(f"Token: {permission.token}")

    # Use the token
    send_email(recipient="client@example.com", otp_token=permission.token)

    # Mark token as used
    client.use_token(permission.id, permission.token)`}</code>
      </pre>

      <h2>Async Support</h2>

      <p>
        The Python SDK supports async/await for use with asyncio:
      </p>

      <pre className="language-python">
        <code>{`import asyncio
from agent_otp import AsyncAgentOTPClient

async def main():
    client = AsyncAgentOTPClient(api_key="ak_live_xxxx")

    permission = await client.request_permission(
        action="file.read",
        scope={"max_size": 1048576},
        wait_for_approval=True,
    )

    if permission.status == "approved":
        # Use the token
        await process_file(permission.token)
        await client.use_token(permission.id, permission.token)

asyncio.run(main())`}</code>
      </pre>

      <h2>Client Configuration</h2>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient

client = AgentOTPClient(
    api_key="ak_live_xxxx",
    base_url="https://api.agentotp.com",  # Optional
    timeout=30.0,                          # Request timeout in seconds
    retries=3,                             # Number of retry attempts
    debug=False,                           # Enable debug logging
)`}</code>
      </pre>

      <h2>Permission Request</h2>

      <h3>Parameters</h3>

      <div className="not-prose my-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-4 text-left font-semibold">Parameter</th>
              <th className="py-2 px-4 text-left font-semibold">Type</th>
              <th className="py-2 px-4 text-left font-semibold">Required</th>
              <th className="py-2 px-4 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">action</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">str</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">The action being requested</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">resource</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">str</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Specific resource being accessed</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">scope</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">dict</td>
              <td className="py-2 px-4">Yes</td>
              <td className="py-2 px-4">Scope constraints</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">context</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">dict</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Additional context</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">ttl</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">int</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Token TTL in seconds (default: 300)</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 px-4 font-mono">wait_for_approval</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">bool</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Block until approved/denied</td>
            </tr>
            <tr>
              <td className="py-2 px-4 font-mono">timeout</td>
              <td className="py-2 px-4 font-mono text-muted-foreground">float</td>
              <td className="py-2 px-4">No</td>
              <td className="py-2 px-4">Approval wait timeout in seconds</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Error Handling</h2>

      <pre className="language-python">
        <code>{`from agent_otp import (
    AgentOTPClient,
    AgentOTPError,
    AuthenticationError,
    ValidationError,
    RateLimitError,
    NetworkError,
)

client = AgentOTPClient(api_key="ak_live_xxxx")

try:
    permission = client.request_permission(
        action="email.send",
        scope={"max_emails": 1},
    )
except AuthenticationError as e:
    print(f"Invalid API key: {e}")
except ValidationError as e:
    print(f"Invalid request: {e.details}")
except RateLimitError as e:
    print(f"Rate limited, retry after {e.retry_after}s")
except NetworkError as e:
    print(f"Network error: {e}")
except AgentOTPError as e:
    print(f"API error: {e.code} - {e.message}")`}</code>
      </pre>

      <h2>Context Manager</h2>

      <p>
        Use the client as a context manager to ensure proper cleanup:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient

with AgentOTPClient(api_key="ak_live_xxxx") as client:
    permission = client.request_permission(
        action="file.write",
        scope={"max_size": 1048576},
    )

    # Client is automatically closed when exiting the context`}</code>
      </pre>

      <h2>Type Hints</h2>

      <p>
        The SDK is fully typed for excellent IDE support:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import (
    AgentOTPClient,
    PermissionRequest,
    PermissionResponse,
    PermissionStatus,
)

def process_with_permission(
    client: AgentOTPClient,
    action: str,
) -> PermissionResponse:
    request: PermissionRequest = {
        "action": action,
        "scope": {"max_count": 1},
    }

    response: PermissionResponse = client.request_permission(**request)

    if response.status == PermissionStatus.APPROVED:
        return response

    raise ValueError(f"Permission {response.status}")`}</code>
      </pre>

      <h2>Integration Examples</h2>

      <h3>LangChain</h3>

      <pre className="language-python">
        <code>{`from langchain.tools import BaseTool
from agent_otp import AgentOTPClient

class OTPProtectedTool(BaseTool):
    name = "email_sender"
    description = "Send emails with OTP protection"

    def __init__(self):
        self.otp_client = AgentOTPClient(api_key="ak_live_xxxx")

    def _run(self, recipient: str, subject: str, body: str) -> str:
        permission = self.otp_client.request_permission(
            action="email.send",
            resource=f"email:{recipient}",
            scope={"max_emails": 1},
            wait_for_approval=True,
        )

        if permission.status != "approved":
            return f"Permission denied: {permission.reason}"

        # Send email using the token
        result = send_email(recipient, subject, body, permission.token)
        self.otp_client.use_token(permission.id, permission.token)

        return "Email sent successfully"`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/quickstart" className="text-primary hover:underline">
            Quick Start Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/errors" className="text-primary hover:underline">
            Error Handling Guide
          </Link>
        </li>
        <li>
          <Link href="/docs/integrations/langchain" className="text-primary hover:underline">
            LangChain Integration
          </Link>
        </li>
      </ul>
    </article>
  );
}
