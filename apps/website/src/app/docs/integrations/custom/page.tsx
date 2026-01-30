import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Custom Agent Integration',
  description: 'Integrate Agent OTP with any custom AI agent framework. Learn patterns and best practices.',
};

export default function CustomIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>Custom Agent Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Integrate Agent OTP with any AI agent framework or custom implementation.
        Learn the patterns and best practices for secure integration.
      </p>

      <h2>Integration Pattern</h2>

      <p>
        The basic pattern for integrating Agent OTP with any agent:
      </p>

      <pre className="language-text">
        <code>{`Agent wants to perform action
        │
        ▼
Request permission from Agent OTP
        │
        ├─── Auto-approved ──▶ Receive token immediately
        │
        ├─── Needs approval ──▶ Wait for human decision
        │                              │
        │                              ├─── Approved ──▶ Receive token
        │                              │
        │                              └─── Denied ──▶ Handle gracefully
        │
        └─── Denied by policy ──▶ Handle gracefully
        │
        ▼
Perform action with token
        │
        ▼
Mark token as used`}</code>
      </pre>

      <h2>TypeScript Implementation</h2>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

// Initialize client
const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_KEY!,
});

// Your agent's action executor
class SecureActionExecutor {
  private otp: AgentOTPClient;

  constructor(otpClient: AgentOTPClient) {
    this.otp = otpClient;
  }

  async executeAction(
    action: string,
    params: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<{ success: boolean; result?: unknown; error?: string }> {
    // 1. Request permission
    const permission = await this.otp.requestPermission({
      action,
      scope: this.buildScope(action, params),
      context: {
        ...context,
        params,
        timestamp: new Date().toISOString(),
      },
      waitForApproval: true,
      timeout: 60000,
      onPendingApproval: (info) => {
        // Notify user that approval is needed
        this.notifyPendingApproval(info);
      },
    });

    // 2. Check result
    if (permission.status !== 'approved') {
      return {
        success: false,
        error: \`Action not permitted: \${permission.reason || permission.status}\`,
      };
    }

    // 3. Execute the action
    try {
      const result = await this.performAction(action, params, permission.token!);

      // 4. Mark token as used
      await this.otp.useToken(permission.id, permission.token!, {
        result_summary: JSON.stringify(result).slice(0, 500),
      });

      return { success: true, result };
    } catch (error) {
      // Revoke token on failure
      await this.otp.revokeToken(permission.id, permission.token!);
      throw error;
    }
  }

  private buildScope(action: string, params: Record<string, unknown>) {
    // Define scopes based on action type
    const scopeBuilders: Record<string, () => Record<string, unknown>> = {
      'email.send': () => ({
        max_emails: 1,
        allowed_recipients: [params.to],
      }),
      'file.write': () => ({
        max_size: 1048576,
        allowed_paths: [params.path],
      }),
      'api.call': () => ({
        allowed_urls: [params.url],
        allowed_methods: ['GET', 'POST'],
      }),
    };

    return scopeBuilders[action]?.() || {};
  }

  private async performAction(
    action: string,
    params: Record<string, unknown>,
    token: string
  ): Promise<unknown> {
    // Your action implementation
    // The token can be passed to downstream services for verification
    throw new Error(\`Action \${action} not implemented\`);
  }

  private notifyPendingApproval(info: { approvalUrl: string }) {
    console.log(\`Approval needed: \${info.approvalUrl}\`);
    // Implement your notification logic
  }
}`}</code>
      </pre>

      <h2>Python Implementation</h2>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient, PermissionDeniedError
from typing import Any, Dict, Optional, Callable

class SecureActionExecutor:
    def __init__(self, api_key: str):
        self.otp = AgentOTPClient(api_key=api_key)
        self.action_handlers: Dict[str, Callable] = {}

    def register_action(self, action: str, handler: Callable):
        """Register a handler for an action type."""
        self.action_handlers[action] = handler

    def execute(
        self,
        action: str,
        params: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute an action with OTP protection."""

        # Build scope based on action
        scope = self._build_scope(action, params)

        # Request permission
        permission = self.otp.request_permission(
            action=action,
            scope=scope,
            context={
                **(context or {}),
                "params": params,
            },
            wait_for_approval=True,
            timeout=60
        )

        if permission.status != "approved":
            return {
                "success": False,
                "error": f"Permission {permission.status}: {permission.reason}"
            }

        # Execute action
        try:
            handler = self.action_handlers.get(action)
            if not handler:
                raise ValueError(f"No handler for action: {action}")

            result = handler(params, permission.token)

            # Mark token as used
            self.otp.use_token(
                permission.id,
                permission.token,
                {"result": str(result)[:500]}
            )

            return {"success": True, "result": result}

        except Exception as e:
            # Revoke token on failure
            self.otp.revoke_token(permission.id, permission.token)
            raise

    def _build_scope(self, action: str, params: Dict) -> Dict:
        """Build scope constraints based on action type."""
        scope_builders = {
            "email.send": lambda p: {
                "max_emails": 1,
                "allowed_recipients": [p.get("to")]
            },
            "file.write": lambda p: {
                "max_size": 1048576,
                "allowed_paths": [p.get("path")]
            },
            "database.query": lambda p: {
                "allowed_operations": ["SELECT"],
                "max_rows": 1000
            }
        }

        builder = scope_builders.get(action, lambda p: {})
        return builder(params)


# Usage
executor = SecureActionExecutor(api_key="ak_live_xxxx")

# Register action handlers
executor.register_action(
    "email.send",
    lambda params, token: send_email(params["to"], params["subject"], params["body"])
)

executor.register_action(
    "file.write",
    lambda params, token: write_file(params["path"], params["content"])
)

# Execute with OTP protection
result = executor.execute(
    action="email.send",
    params={"to": "user@example.com", "subject": "Hello", "body": "..."},
    context={"triggered_by": "user_request"}
)`}</code>
      </pre>

      <h2>Webhook Integration</h2>

      <p>
        For asynchronous agents, use webhooks to receive approval notifications:
      </p>

      <pre className="language-typescript">
        <code>{`// 1. Request permission without waiting
const permission = await otp.requestPermission({
  action: 'email.send',
  scope: { max_emails: 1 },
  waitForApproval: false,
  webhookUrl: 'https://your-agent.com/webhooks/otp',
});

if (permission.status === 'pending') {
  // Store permission ID for later
  await saveJobState({
    jobId,
    permissionId: permission.id,
    status: 'waiting_approval',
  });
}

// 2. Handle webhook callback
app.post('/webhooks/otp', async (req, res) => {
  const { permission_id, status, token } = req.body;

  // Verify webhook signature
  const signature = req.headers['x-otp-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Resume the job
  const job = await getJobByPermissionId(permission_id);

  if (status === 'approved') {
    // Continue with the action
    await executeAction(job, token);
  } else {
    // Handle denial
    await markJobFailed(job, 'Permission denied');
  }

  res.status(200).send('OK');
});`}</code>
      </pre>

      <h2>Middleware Pattern</h2>

      <p>
        Create middleware for your agent framework:
      </p>

      <pre className="language-typescript">
        <code>{`// OTP middleware for your agent
function createOTPMiddleware(otp: AgentOTPClient) {
  return async function otpMiddleware(
    action: string,
    params: unknown,
    next: () => Promise<unknown>
  ) {
    // Check if action requires OTP
    if (!requiresOTP(action)) {
      return next();
    }

    // Request permission
    const permission = await otp.requestPermission({
      action,
      scope: buildScope(action, params),
      waitForApproval: true,
    });

    if (permission.status !== 'approved') {
      throw new PermissionDeniedError(permission.reason);
    }

    // Execute action
    const result = await next();

    // Mark token as used
    await otp.useToken(permission.id, permission.token!);

    return result;
  };
}

// Use in your agent
const middleware = createOTPMiddleware(otp);

agent.use(middleware);`}</code>
      </pre>

      <h2>Error Handling Best Practices</h2>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  PermissionDeniedError,
  TokenExpiredError,
} from '@orrisai/agent-otp-sdk';

async function executeWithOTP(action: string, params: unknown) {
  try {
    const permission = await otp.requestPermission({
      action,
      scope: {},
      waitForApproval: true,
    });

    if (permission.status === 'approved') {
      await performAction(action, params);
      await otp.useToken(permission.id, permission.token!);
      return { success: true };
    }

    return { success: false, reason: permission.reason };

  } catch (error) {
    if (error instanceof AuthenticationError) {
      // API key issue - log and alert
      console.error('OTP authentication failed');
      throw new Error('Configuration error');
    }

    if (error instanceof RateLimitError) {
      // Queue for retry
      await queueForRetry(action, params, error.retryAfter);
      return { success: false, reason: 'Rate limited', retryAfter: error.retryAfter };
    }

    if (error instanceof ValidationError) {
      // Log validation errors for debugging
      console.error('Invalid OTP request:', error.details);
      throw error;
    }

    if (error instanceof PermissionDeniedError) {
      return { success: false, reason: error.reason };
    }

    // Unknown error - rethrow
    throw error;
  }
}`}</code>
      </pre>

      <h2>Testing Integration</h2>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

describe('OTP Integration', () => {
  let otp: AgentOTPClient;

  beforeEach(() => {
    // Use test API key - auto-approves all requests
    otp = new AgentOTPClient({
      apiKey: process.env.AGENT_OTP_TEST_KEY!,
    });
  });

  it('should request and use permission', async () => {
    const permission = await otp.requestPermission({
      action: 'test.action',
      scope: { test: true },
    });

    expect(permission.status).toBe('approved');
    expect(permission.token).toBeDefined();

    const result = await otp.useToken(permission.id, permission.token!);
    expect(result.success).toBe(true);
  });

  it('should handle denied permissions', async () => {
    // Test keys can simulate denials with special context
    const permission = await otp.requestPermission({
      action: 'test.action',
      scope: {},
      context: { _test_deny: true },
    });

    expect(permission.status).toBe('denied');
  });
});`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/sdk/typescript" className="text-primary hover:underline">
            TypeScript SDK Reference
          </Link>
        </li>
        <li>
          <Link href="/docs/sdk/python" className="text-primary hover:underline">
            Python SDK Reference
          </Link>
        </li>
        <li>
          <Link href="/docs/api/permissions" className="text-primary hover:underline">
            Permissions API
          </Link>
        </li>
      </ul>
    </article>
  );
}
