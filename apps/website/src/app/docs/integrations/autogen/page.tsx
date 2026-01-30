import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AutoGen Integration',
  description: 'Integrate Agent OTP with Microsoft AutoGen to securely relay OTPs in multi-agent conversations.',
};

export default function AutoGenIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>AutoGen Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Securely relay OTPs to your AutoGen agents. Enable multi-agent
        conversations to complete verification flows securely.
      </p>

      <div className="not-prose my-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> The Python SDK is coming soon. This guide shows
          the integration pattern. The Python SDK will have a similar API.
        </p>
      </div>

      <h2>Overview</h2>

      <p>
        Agent OTP helps your AutoGen agents receive verification codes securely:
      </p>

      <ul>
        <li>Agent requests an OTP when it needs to complete a verification</li>
        <li>User approves which OTP to share</li>
        <li>OTP is encrypted and delivered to the agent</li>
        <li>OTP is auto-deleted after consumption</li>
      </ul>

      <h2>Python Example (Coming Soon)</h2>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient, generate_key_pair, export_public_key
import autogen

otp = AgentOTPClient(api_key="ak_live_xxxx")

# Generate encryption keys
public_key, private_key = generate_key_pair()

def sign_up_with_otp(
    service_name: str,
    email: str,
    service_url: str
) -> str:
    """Sign up for a service with OTP verification."""

    # Step 1: Start the sign-up process
    start_signup(service_url, email)

    # Step 2: Request OTP from Agent OTP
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
        return f"Could not get OTP: {request.status}"

    # Step 3: Consume the OTP
    result = otp.consume_otp(request.id, private_key)

    # Step 4: Complete verification
    complete_verification(service_url, result.code)

    return f"Successfully signed up for {service_name} with {email}"


# Configure agents
config_list = [{"model": "gpt-4", "api_key": "your-api-key"}]

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": config_list},
    system_message="You help users sign up for services."
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={"work_dir": "workspace"}
)

# Register the OTP function
user_proxy.register_function(
    function_map={
        "sign_up_with_otp": sign_up_with_otp
    }
)

# Start conversation
user_proxy.initiate_chat(
    assistant,
    message="Sign up for Acme Inc at https://acme.com with user@example.com"
)`}</code>
      </pre>

      <h2>OTP Function Decorator</h2>

      <p>
        Create a decorator to add OTP capabilities to functions:
      </p>

      <pre className="language-python">
        <code>{`from functools import wraps
from agent_otp import AgentOTPClient, generate_key_pair, export_public_key

class OTPManager:
    """Centralized OTP management for AutoGen."""

    def __init__(self, api_key: str):
        self.otp = AgentOTPClient(api_key=api_key)
        self.public_key, self.private_key = generate_key_pair()

    def get_otp(self, reason: str, expected_sender: str = None, **kwargs) -> str:
        """Request and consume an OTP."""
        request = self.otp.request_otp(
            reason=reason,
            expected_sender=expected_sender,
            public_key=export_public_key(self.public_key),
            wait_for_otp=True,
            **kwargs
        )

        if request.status != "otp_received":
            raise Exception(f"Failed to get OTP: {request.status}")

        result = self.otp.consume_otp(request.id, self.private_key)
        return result.code


# Create global OTP manager
otp_manager = OTPManager(api_key="ak_live_xxxx")

def requires_otp(reason_template: str, expected_sender_key: str = None):
    """Decorator to add OTP verification to a function."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Format the reason with kwargs
            reason = reason_template.format(**kwargs)
            expected_sender = kwargs.get(expected_sender_key) if expected_sender_key else None

            # Get the OTP
            code = otp_manager.get_otp(
                reason=reason,
                expected_sender=expected_sender
            )

            # Add code to kwargs
            kwargs['otp_code'] = code

            return func(*args, **kwargs)
        return wrapper
    return decorator


@requires_otp(
    reason_template="Verification for {service_name}",
    expected_sender_key="service_name"
)
def complete_signup(service_name: str, email: str, otp_code: str = None) -> str:
    """Complete a signup with OTP verification."""
    # Use otp_code for verification
    verify_email(service_name, email, otp_code)
    return f"Successfully verified {email} for {service_name}"`}</code>
      </pre>

      <h2>GroupChat with OTP</h2>

      <p>
        Enable OTP verification in multi-agent group chats:
      </p>

      <pre className="language-python">
        <code>{`# Create multiple agents
researcher = autogen.AssistantAgent(
    name="researcher",
    llm_config={"config_list": config_list},
    system_message="Research services and find signup URLs"
)

executor = autogen.AssistantAgent(
    name="executor",
    llm_config={"config_list": config_list},
    system_message="Execute signups using available tools"
)

# Create group chat
groupchat = autogen.GroupChat(
    agents=[user_proxy, researcher, executor],
    messages=[],
    max_round=20
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": config_list}
)

# Register OTP functions for the executor
user_proxy.register_function(
    function_map={
        "sign_up_with_otp": sign_up_with_otp,
        "verify_email": lambda email, service: otp_manager.get_otp(
            reason=f"Email verification for {service}",
            expected_sender=service
        )
    }
)

# Start conversation
user_proxy.initiate_chat(
    manager,
    message="Research and sign up for the top 3 AI newsletter services"
)`}</code>
      </pre>

      <h2>Two-Agent Conversations</h2>

      <pre className="language-python">
        <code>{`from agent_otp import OTPApprovalDeniedError, OTPExpiredError

class OTPConversation:
    """Manage OTP-enabled conversations."""

    def __init__(self, assistant, user_proxy, otp_manager):
        self.assistant = assistant
        self.user_proxy = user_proxy
        self.otp_manager = otp_manager

    def run(self, initial_message: str) -> str:
        """Run a conversation with OTP support."""

        # Register OTP helper function
        def get_verification_code(service: str, reason: str) -> str:
            try:
                code = self.otp_manager.get_otp(
                    reason=reason,
                    expected_sender=service,
                    timeout=120
                )
                return f"Verification code: {code}"
            except OTPApprovalDeniedError:
                return "User denied the OTP request"
            except OTPExpiredError:
                return "OTP request timed out"
            except Exception as e:
                return f"Error getting OTP: {str(e)}"

        self.user_proxy.register_function(
            function_map={"get_verification_code": get_verification_code}
        )

        # Run the conversation
        self.user_proxy.initiate_chat(
            self.assistant,
            message=initial_message
        )

        return self.user_proxy.last_message()


# Usage
conversation = OTPConversation(assistant, user_proxy, otp_manager)
result = conversation.run("Sign up for GitHub with dev@example.com")`}</code>
      </pre>

      <h2>Error Handling</h2>

      <pre className="language-python">
        <code>{`from agent_otp import (
    OTPNotFoundError,
    OTPExpiredError,
    OTPAlreadyConsumedError,
    OTPApprovalDeniedError,
    RateLimitError,
)

def robust_otp_signup(service: str, email: str) -> str:
    """Sign up with comprehensive error handling."""
    try:
        # Start signup
        start_signup(service, email)

        # Get OTP
        code = otp_manager.get_otp(
            reason=f"Signup for {service}",
            expected_sender=service,
            filter={"sources": ["email"]},
            timeout=120
        )

        # Complete verification
        complete_verification(service, code)
        return f"Successfully signed up for {service}"

    except OTPApprovalDeniedError:
        return f"Signup cancelled: User denied OTP access"

    except OTPExpiredError:
        return f"Signup failed: Verification timed out"

    except OTPAlreadyConsumedError:
        return f"Signup failed: OTP already used"

    except RateLimitError as e:
        return f"Signup delayed: Rate limited, retry in {e.retry_after}s"

    except Exception as e:
        return f"Signup error: {str(e)}"`}</code>
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
          <Link href="/docs/integrations/langchain" className="text-primary hover:underline">
            LangChain Integration
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
