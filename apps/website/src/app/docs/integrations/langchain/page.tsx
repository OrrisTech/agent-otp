import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LangChain Integration',
  description: 'Integrate Agent OTP with LangChain to securely relay OTPs to your LangChain agents.',
};

export default function LangChainIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>LangChain Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Securely relay OTPs to your LangChain agents. Enable your agents to
        complete verification flows without direct access to SMS or email.
      </p>

      <div className="not-prose my-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> The Python SDK is coming soon. This guide shows
          the integration pattern using the TypeScript SDK. The Python SDK will
          have a similar API.
        </p>
      </div>

      <h2>Overview</h2>

      <p>
        Agent OTP helps your LangChain agents receive verification codes securely:
      </p>

      <ul>
        <li>Agent requests an OTP when it needs to complete a verification</li>
        <li>User approves which OTP to share</li>
        <li>OTP is encrypted and delivered to the agent</li>
        <li>OTP is auto-deleted after consumption</li>
      </ul>

      <h2>TypeScript Example</h2>

      <p>
        Here&apos;s how to create an OTP-enabled tool for LangChain.js:
      </p>

      <pre className="language-typescript">
        <code>{`import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey,
} from '@orrisai/agent-otp-sdk';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});

// Store key pair securely (e.g., in environment or secure storage)
const { publicKey, privateKey } = await generateKeyPair();

const signUpTool = new DynamicStructuredTool({
  name: 'sign_up_for_service',
  description: 'Sign up for a service that requires email verification',
  schema: z.object({
    email: z.string().email(),
    serviceName: z.string(),
    serviceUrl: z.string().url(),
  }),
  func: async ({ email, serviceName, serviceUrl }) => {
    // Step 1: Start the sign-up process (your implementation)
    await startSignUp(serviceUrl, email);

    // Step 2: Request OTP from Agent OTP
    const request = await otp.requestOTP({
      reason: \`Sign up verification for \${serviceName}\`,
      expectedSender: serviceName,
      filter: {
        sources: ['email'],
        senderPattern: \`*@\${new URL(serviceUrl).hostname}\`,
      },
      publicKey: await exportPublicKey(publicKey),
      waitForOTP: true,
      timeout: 120000, // 2 minutes
    });

    if (request.status !== 'otp_received') {
      return \`Could not get verification code: \${request.status}\`;
    }

    // Step 3: Consume the OTP
    const { code } = await otp.consumeOTP(request.id, privateKey);

    // Step 4: Complete verification (your implementation)
    await completeVerification(serviceUrl, code);

    return \`Successfully signed up for \${serviceName} with \${email}\`;
  },
});`}</code>
      </pre>

      <h2>Python Example (Coming Soon)</h2>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient, generate_key_pair, export_public_key
from langchain.tools import BaseTool

otp = AgentOTPClient(api_key="ak_live_xxxx")

# Generate encryption keys
public_key, private_key = generate_key_pair()

class SignUpTool(BaseTool):
    name = "sign_up_for_service"
    description = "Sign up for a service that requires email verification"

    def _run(self, email: str, service_name: str, service_url: str) -> str:
        # Start sign-up process
        start_sign_up(service_url, email)

        # Request OTP
        request = otp.request_otp(
            reason=f"Sign up verification for {service_name}",
            expected_sender=service_name,
            filter={
                "sources": ["email"],
                "sender_pattern": f"*@{service_url.split('/')[2]}"
            },
            public_key=export_public_key(public_key),
            wait_for_otp=True,
            timeout=120
        )

        if request.status != "otp_received":
            return f"Could not get verification code: {request.status}"

        # Consume the OTP
        result = otp.consume_otp(request.id, private_key)

        # Complete verification
        complete_verification(service_url, result.code)

        return f"Successfully signed up for {service_name}"`}</code>
      </pre>

      <h2>Handling OTP States</h2>

      <p>
        Your agent should handle different OTP request states:
      </p>

      <pre className="language-typescript">
        <code>{`const handleOTPRequest = async (reason: string, sender: string) => {
  const request = await otp.requestOTP({
    reason,
    expectedSender: sender,
    publicKey: await exportPublicKey(publicKey),
    waitForOTP: true,
    timeout: 120000,
  });

  switch (request.status) {
    case 'otp_received':
      const { code } = await otp.consumeOTP(request.id, privateKey);
      return { success: true, code };

    case 'pending_approval':
      return { success: false, reason: 'Waiting for user approval' };

    case 'approved':
      return { success: false, reason: 'Waiting for OTP to arrive' };

    case 'denied':
      return { success: false, reason: 'User denied the request' };

    case 'expired':
      return { success: false, reason: 'Request timed out' };

    default:
      return { success: false, reason: \`Unexpected status: \${request.status}\` };
  }
};`}</code>
      </pre>

      <h2>Error Handling</h2>

      <pre className="language-typescript">
        <code>{`import {
  OTPNotFoundError,
  OTPExpiredError,
  OTPAlreadyConsumedError,
  OTPApprovalDeniedError,
  DecryptionError,
  RateLimitError,
} from '@orrisai/agent-otp-sdk';

const signUpTool = new DynamicStructuredTool({
  name: 'sign_up_with_otp',
  description: 'Sign up with OTP verification',
  schema: z.object({ /* ... */ }),
  func: async (params) => {
    try {
      const request = await otp.requestOTP({
        reason: 'Sign up verification',
        publicKey: await exportPublicKey(publicKey),
        waitForOTP: true,
      });

      if (request.status === 'otp_received') {
        const { code } = await otp.consumeOTP(request.id, privateKey);
        return \`Received code: \${code}\`;
      }

      return \`OTP request status: \${request.status}\`;

    } catch (error) {
      if (error instanceof OTPApprovalDeniedError) {
        return 'User denied the OTP request';
      }
      if (error instanceof OTPExpiredError) {
        return 'OTP request expired - please try again';
      }
      if (error instanceof OTPAlreadyConsumedError) {
        return 'OTP was already consumed';
      }
      if (error instanceof DecryptionError) {
        return 'Failed to decrypt OTP - check your keys';
      }
      if (error instanceof RateLimitError) {
        return \`Rate limited - retry in \${error.retryAfter}s\`;
      }
      throw error;
    }
  },
});`}</code>
      </pre>

      <h2>LangGraph Integration</h2>

      <p>
        For complex workflows, use LangGraph with OTP nodes:
      </p>

      <pre className="language-typescript">
        <code>{`import { StateGraph, END } from '@langchain/langgraph';

interface WorkflowState {
  action: string;
  otpRequestId?: string;
  otpStatus?: string;
  code?: string;
  result?: string;
}

const requestOTPNode = async (state: WorkflowState) => {
  const request = await otp.requestOTP({
    reason: \`Verification for \${state.action}\`,
    publicKey: await exportPublicKey(publicKey),
    waitForOTP: false,
  });

  return {
    ...state,
    otpRequestId: request.id,
    otpStatus: request.status,
  };
};

const checkStatusNode = async (state: WorkflowState) => {
  const status = await otp.getOTPStatus(state.otpRequestId!);
  return { ...state, otpStatus: status.status };
};

const consumeOTPNode = async (state: WorkflowState) => {
  const { code } = await otp.consumeOTP(state.otpRequestId!, privateKey);
  return { ...state, code };
};

const graph = new StateGraph<WorkflowState>({
  channels: {
    action: { value: null },
    otpRequestId: { value: null },
    otpStatus: { value: null },
    code: { value: null },
    result: { value: null },
  },
});

graph.addNode('request_otp', requestOTPNode);
graph.addNode('check_status', checkStatusNode);
graph.addNode('consume_otp', consumeOTPNode);

graph.setEntryPoint('request_otp');

graph.addConditionalEdges('request_otp', (state) =>
  state.otpStatus === 'otp_received' ? 'consume_otp' : 'check_status'
);

graph.addConditionalEdges('check_status', (state) =>
  state.otpStatus === 'otp_received' ? 'consume_otp' : 'check_status'
);

graph.addEdge('consume_otp', END);`}</code>
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
          <Link href="/docs/integrations/custom" className="text-primary hover:underline">
            Custom Agent Integration
          </Link>
        </li>
      </ul>
    </article>
  );
}
