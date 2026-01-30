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
        Learn the patterns and best practices for secure OTP relay.
      </p>

      <h2>Integration Pattern</h2>

      <p>
        The basic pattern for integrating Agent OTP with any agent:
      </p>

      <pre className="language-text">
        <code>{`Agent needs verification code
        │
        ▼
Generate key pair (once per agent session)
        │
        ▼
Request OTP from Agent OTP
        │
        ├─── pending_approval ──▶ Wait for user approval
        │                              │
        │                              ├─── approved ──▶ Wait for OTP
        │                              │                    │
        │                              │                    └─── otp_received ──▶ Consume
        │                              │
        │                              └─── denied ──▶ Handle gracefully
        │
        └─── expired ──▶ Handle gracefully
        │
        ▼
Consume OTP (one-time read)
        │
        ▼
Decrypt with private key
        │
        ▼
Use the code`}</code>
      </pre>

      <h2>TypeScript Implementation</h2>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey,
  OTPRequestStatus,
} from '@orrisai/agent-otp-sdk';

// Initialize client
const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});

// Generate key pair once per agent session
const { publicKey, privateKey } = await generateKeyPair();

// Your agent's OTP-enabled action executor
class SecureAgentExecutor {
  private otp: AgentOTPClient;
  private publicKey: CryptoKey;
  private privateKey: CryptoKey;

  constructor(
    otpClient: AgentOTPClient,
    publicKey: CryptoKey,
    privateKey: CryptoKey
  ) {
    this.otp = otpClient;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  async executeWithOTP(
    action: string,
    params: Record<string, unknown>
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    // 1. Request OTP
    const request = await this.otp.requestOTP({
      reason: \`\${action}: \${JSON.stringify(params)}\`,
      expectedSender: params.service as string,
      filter: params.filter as { sources?: string[]; senderPattern?: string },
      publicKey: await exportPublicKey(this.publicKey),
      waitForOTP: true,
      timeout: 120000,
    });

    // 2. Check status
    if (request.status !== 'otp_received') {
      return {
        success: false,
        error: \`OTP request failed: \${request.status}\`,
      };
    }

    // 3. Consume the OTP
    try {
      const { code } = await this.otp.consumeOTP(request.id, this.privateKey);
      return { success: true, code };
    } catch (error) {
      return {
        success: false,
        error: \`Failed to consume OTP: \${error}\`,
      };
    }
  }
}

// Usage
const executor = new SecureAgentExecutor(otp, publicKey, privateKey);

const result = await executor.executeWithOTP('signup_verification', {
  service: 'Acme Inc',
  email: 'user@example.com',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
});

if (result.success) {
  console.log('Received OTP:', result.code);
  // Use the code for verification
}`}</code>
      </pre>

      <h2>Python Implementation (Coming Soon)</h2>

      <pre className="language-python">
        <code>{`from agent_otp import (
    AgentOTPClient,
    generate_key_pair,
    export_public_key,
)
from typing import Dict, Any, Optional

class SecureAgentExecutor:
    def __init__(self, api_key: str):
        self.otp = AgentOTPClient(api_key=api_key)
        self.public_key, self.private_key = generate_key_pair()

    def execute_with_otp(
        self,
        action: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Execute an action that requires OTP verification."""

        # Build filter from params
        filter_opts = params.get("filter", {})

        # Request OTP
        request = self.otp.request_otp(
            reason=f"{action}: {params}",
            expected_sender=params.get("service"),
            filter=filter_opts if filter_opts else None,
            public_key=export_public_key(self.public_key),
            wait_for_otp=True,
            timeout=120
        )

        if request.status != "otp_received":
            return {
                "success": False,
                "error": f"OTP request failed: {request.status}"
            }

        # Consume the OTP
        try:
            result = self.otp.consume_otp(request.id, self.private_key)
            return {"success": True, "code": result.code}
        except Exception as e:
            return {"success": False, "error": str(e)}


# Usage
executor = SecureAgentExecutor(api_key="ak_live_xxxx")

result = executor.execute_with_otp("signup_verification", {
    "service": "Acme Inc",
    "email": "user@example.com",
    "filter": {
        "sources": ["email"],
        "sender_pattern": "*@acme.com"
    }
})

if result["success"]:
    print(f"Received OTP: {result['code']}")`}</code>
      </pre>

      <h2>Webhook Integration</h2>

      <p>
        For asynchronous agents, use webhooks to receive OTP notifications:
      </p>

      <pre className="language-typescript">
        <code>{`// 1. Request OTP without waiting
const request = await otp.requestOTP({
  reason: 'Signup verification',
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: false,  // Don't block
  webhookUrl: 'https://your-agent.com/webhooks/otp',
});

// Store request ID for later
await saveJobState({
  jobId,
  otpRequestId: request.id,
  status: 'waiting_for_otp',
});

// 2. Handle webhook callback
app.post('/webhooks/otp', async (req, res) => {
  const { request_id, status } = req.body;

  // Verify webhook signature
  const signature = req.headers['x-otp-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  // Resume the job
  const job = await getJobByOTPRequestId(request_id);

  if (status === 'otp_received') {
    // Consume the OTP
    const { code } = await otp.consumeOTP(request_id, privateKey);
    await completeJob(job, code);
  } else if (status === 'denied' || status === 'expired') {
    await failJob(job, \`OTP \${status}\`);
  }

  res.status(200).send('OK');
});`}</code>
      </pre>

      <h2>Polling Pattern</h2>

      <p>
        If webhooks aren&apos;t available, use polling:
      </p>

      <pre className="language-typescript">
        <code>{`async function pollForOTP(
  requestId: string,
  maxAttempts: number = 60,
  intervalMs: number = 2000
): Promise<string | null> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await otp.getOTPStatus(requestId);

    switch (status.status) {
      case 'otp_received':
        const { code } = await otp.consumeOTP(requestId, privateKey);
        return code;

      case 'denied':
      case 'expired':
      case 'cancelled':
        return null;

      case 'pending_approval':
      case 'approved':
        // Still waiting, continue polling
        await sleep(intervalMs);
        break;

      default:
        throw new Error(\`Unexpected status: \${status.status}\`);
    }
  }

  // Timeout
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}`}</code>
      </pre>

      <h2>Middleware Pattern</h2>

      <p>
        Create middleware for your agent framework:
      </p>

      <pre className="language-typescript">
        <code>{`type Action = {
  type: string;
  requiresOTP?: boolean;
  otpReason?: string;
  params: Record<string, unknown>;
};

function createOTPMiddleware(
  otp: AgentOTPClient,
  publicKey: CryptoKey,
  privateKey: CryptoKey
) {
  return async function otpMiddleware(
    action: Action,
    next: (code?: string) => Promise<unknown>
  ) {
    // Check if action requires OTP
    if (!action.requiresOTP) {
      return next();
    }

    // Request OTP
    const request = await otp.requestOTP({
      reason: action.otpReason || action.type,
      publicKey: await exportPublicKey(publicKey),
      waitForOTP: true,
    });

    if (request.status !== 'otp_received') {
      throw new Error(\`OTP request failed: \${request.status}\`);
    }

    // Consume OTP
    const { code } = await otp.consumeOTP(request.id, privateKey);

    // Execute action with code
    return next(code);
  };
}

// Use in your agent
const middleware = createOTPMiddleware(otp, publicKey, privateKey);

await middleware(
  {
    type: 'signup',
    requiresOTP: true,
    otpReason: 'Sign up for Acme Inc',
    params: { email: 'user@example.com' },
  },
  async (code) => {
    // Use the OTP code
    await completeSignup(code!);
  }
);`}</code>
      </pre>

      <h2>Error Handling Best Practices</h2>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPError,
  AuthenticationError,
  ValidationError,
  RateLimitError,
  OTPNotFoundError,
  OTPExpiredError,
  OTPAlreadyConsumedError,
  OTPApprovalDeniedError,
  DecryptionError,
} from '@orrisai/agent-otp-sdk';

async function executeWithOTP(action: string): Promise<{
  success: boolean;
  code?: string;
  error?: string;
  retryAfter?: number;
}> {
  try {
    const request = await otp.requestOTP({
      reason: action,
      publicKey: await exportPublicKey(publicKey),
      waitForOTP: true,
    });

    if (request.status === 'otp_received') {
      const { code } = await otp.consumeOTP(request.id, privateKey);
      return { success: true, code };
    }

    return { success: false, error: \`Status: \${request.status}\` };

  } catch (error) {
    if (error instanceof AuthenticationError) {
      // API key issue
      console.error('Invalid API key');
      return { success: false, error: 'Authentication failed' };
    }

    if (error instanceof RateLimitError) {
      // Queue for retry
      return {
        success: false,
        error: 'Rate limited',
        retryAfter: error.retryAfter,
      };
    }

    if (error instanceof ValidationError) {
      // Invalid request
      return { success: false, error: \`Validation: \${error.message}\` };
    }

    if (error instanceof OTPApprovalDeniedError) {
      return { success: false, error: 'User denied the request' };
    }

    if (error instanceof OTPExpiredError) {
      return { success: false, error: 'Request expired' };
    }

    if (error instanceof OTPAlreadyConsumedError) {
      return { success: false, error: 'OTP already consumed' };
    }

    if (error instanceof DecryptionError) {
      return { success: false, error: 'Decryption failed - check keys' };
    }

    // Unknown error
    throw error;
  }
}`}</code>
      </pre>

      <h2>Testing Integration</h2>

      <pre className="language-typescript">
        <code>{`import { AgentOTPClient, generateKeyPair, exportPublicKey } from '@orrisai/agent-otp-sdk';

describe('OTP Integration', () => {
  let otp: AgentOTPClient;
  let publicKey: CryptoKey;
  let privateKey: CryptoKey;

  beforeAll(async () => {
    // Use test API key (auto-approves requests)
    otp = new AgentOTPClient({
      apiKey: process.env.AGENT_OTP_TEST_KEY!,
    });

    const keyPair = await generateKeyPair();
    publicKey = keyPair.publicKey;
    privateKey = keyPair.privateKey;
  });

  it('should request and consume OTP', async () => {
    const request = await otp.requestOTP({
      reason: 'Test verification',
      publicKey: await exportPublicKey(publicKey),
      waitForOTP: true,
    });

    expect(request.status).toBe('otp_received');

    const { code } = await otp.consumeOTP(request.id, privateKey);
    expect(code).toBeDefined();
    expect(code.length).toBeGreaterThan(0);
  });

  it('should handle cancellation', async () => {
    const request = await otp.requestOTP({
      reason: 'Test cancellation',
      publicKey: await exportPublicKey(publicKey),
      waitForOTP: false,
    });

    await otp.cancelOTPRequest(request.id);

    const status = await otp.getOTPStatus(request.id);
    expect(status.status).toBe('cancelled');
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
          <Link href="/docs/concepts/how-it-works" className="text-primary hover:underline">
            How Agent OTP Works
          </Link>
        </li>
        <li>
          <Link href="/docs/concepts/encryption" className="text-primary hover:underline">
            End-to-End Encryption
          </Link>
        </li>
        <li>
          <Link href="/docs/api/permissions" className="text-primary hover:underline">
            OTP API Reference
          </Link>
        </li>
      </ul>
    </article>
  );
}
