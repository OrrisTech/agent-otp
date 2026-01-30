import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CrewAI Integration',
  description: 'Integrate Agent OTP with CrewAI to securely relay OTPs to your AI crew members.',
};

export default function CrewAIIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>CrewAI Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Securely relay OTPs to your CrewAI agents. Enable your crew members to
        complete verification flows without direct access to SMS or email.
      </p>

      <div className="not-prose my-4 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> The Python SDK is coming soon. This guide shows
          the integration pattern. The Python SDK will have a similar API.
        </p>
      </div>

      <h2>Overview</h2>

      <p>
        Agent OTP helps your CrewAI agents receive verification codes securely:
      </p>

      <ul>
        <li>Crew member requests an OTP when it needs to complete a verification</li>
        <li>User approves which OTP to share</li>
        <li>OTP is encrypted and delivered to the agent</li>
        <li>OTP is auto-deleted after consumption</li>
      </ul>

      <h2>Python Example (Coming Soon)</h2>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient, generate_key_pair, export_public_key
from crewai import Agent, Task, Crew
from crewai_tools import BaseTool

otp = AgentOTPClient(api_key="ak_live_xxxx")

# Generate encryption keys
public_key, private_key = generate_key_pair()

class OTPSignUpTool(BaseTool):
    name: str = "Sign Up with OTP"
    description: str = "Signs up for a service and handles OTP verification."

    def _run(self, service_name: str, email: str, service_url: str) -> str:
        # Step 1: Start the sign-up process
        self._start_signup(service_url, email)

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
        self._complete_verification(service_url, result.code)

        return f"Successfully signed up for {service_name} with {email}"

    def _start_signup(self, url: str, email: str):
        # Your sign-up implementation
        pass

    def _complete_verification(self, url: str, code: str):
        # Your verification implementation
        pass


# Create agents with OTP tools
signup_tool = OTPSignUpTool()

signup_agent = Agent(
    role="Account Specialist",
    goal="Handle service registrations and verifications",
    backstory="Expert at signing up for online services",
    tools=[signup_tool],
    verbose=True
)

# Create task
signup_task = Task(
    description="Sign up for Acme Inc service at https://acme.com with user@example.com",
    expected_output="Confirmation that signup was completed",
    agent=signup_agent
)

# Create and run crew
crew = Crew(
    agents=[signup_agent],
    tasks=[signup_task],
    verbose=True
)

result = crew.kickoff()`}</code>
      </pre>

      <h2>OTP Tool Wrapper</h2>

      <p>
        Create a wrapper to add OTP capabilities to existing tools:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient, generate_key_pair, export_public_key

class OTPEnabledTool(BaseTool):
    """Base class for tools that need OTP verification."""

    def __init__(self, otp_client: AgentOTPClient, **kwargs):
        super().__init__(**kwargs)
        self.otp = otp_client
        self.public_key, self.private_key = generate_key_pair()

    def request_and_consume_otp(
        self,
        reason: str,
        expected_sender: str = None,
        sources: list = None,
        timeout: int = 120
    ) -> str:
        """Request and consume an OTP, returning the code."""

        filter_opts = {}
        if sources:
            filter_opts["sources"] = sources

        request = self.otp.request_otp(
            reason=reason,
            expected_sender=expected_sender,
            filter=filter_opts if filter_opts else None,
            public_key=export_public_key(self.public_key),
            wait_for_otp=True,
            timeout=timeout
        )

        if request.status != "otp_received":
            raise Exception(f"Failed to get OTP: {request.status}")

        result = self.otp.consume_otp(request.id, self.private_key)
        return result.code


class EmailVerificationTool(OTPEnabledTool):
    name: str = "Verify Email"
    description: str = "Completes email verification for a service"

    def _run(self, service_name: str, email: str) -> str:
        # Trigger verification email (your implementation)
        send_verification_email(service_name, email)

        # Get the OTP
        code = self.request_and_consume_otp(
            reason=f"Email verification for {service_name}",
            expected_sender=service_name,
            sources=["email"]
        )

        # Submit the code (your implementation)
        submit_verification_code(service_name, code)

        return f"Email {email} verified for {service_name}"`}</code>
      </pre>

      <h2>Crew-Level OTP Management</h2>

      <p>
        Manage OTPs at the crew level for coordinated operations:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient, generate_key_pair

class OTPManagedCrew(Crew):
    """A crew with centralized OTP management."""

    def __init__(self, otp_client: AgentOTPClient, **kwargs):
        super().__init__(**kwargs)
        self.otp = otp_client
        # Shared key pair for the crew
        self.public_key, self.private_key = generate_key_pair()

    def get_otp(self, reason: str, **kwargs) -> str:
        """Centralized OTP retrieval for any crew member."""
        from agent_otp import export_public_key

        request = self.otp.request_otp(
            reason=reason,
            public_key=export_public_key(self.public_key),
            wait_for_otp=True,
            **kwargs
        )

        if request.status == "otp_received":
            result = self.otp.consume_otp(request.id, self.private_key)
            return result.code

        raise Exception(f"Failed to get OTP: {request.status}")


# Usage
otp_client = AgentOTPClient(api_key="ak_live_xxxx")

crew = OTPManagedCrew(
    otp_client=otp_client,
    agents=[signup_agent, verification_agent],
    tasks=[signup_task, verify_task],
    verbose=True
)

# Any agent in the crew can now use crew.get_otp()
result = crew.kickoff()`}</code>
      </pre>

      <h2>Handling Multiple OTPs</h2>

      <p>
        For workflows that need multiple verifications:
      </p>

      <pre className="language-python">
        <code>{`class MultiServiceSignUpTool(OTPEnabledTool):
    name: str = "Multi-Service Sign Up"
    description: str = "Signs up for multiple services with OTP verification"

    def _run(self, services: list) -> str:
        results = []

        for service in services:
            try:
                # Start signup
                start_signup(service["url"], service["email"])

                # Get OTP
                code = self.request_and_consume_otp(
                    reason=f"Sign up for {service['name']}",
                    expected_sender=service["name"],
                    sources=["email"]
                )

                # Complete verification
                complete_verification(service["url"], code)
                results.append(f"{service['name']}: Success")

            except Exception as e:
                results.append(f"{service['name']}: Failed - {str(e)}")

        return "\\n".join(results)`}</code>
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

class RobustOTPTool(OTPEnabledTool):
    name: str = "Robust OTP Tool"
    description: str = "Tool with comprehensive error handling"

    def _run(self, service: str, action: str) -> str:
        try:
            code = self.request_and_consume_otp(
                reason=f"{action} for {service}",
                expected_sender=service
            )
            return f"Success! Code: {code}"

        except OTPApprovalDeniedError:
            return "User denied the OTP request"

        except OTPExpiredError:
            return "OTP request timed out - please try again"

        except OTPAlreadyConsumedError:
            return "OTP was already used"

        except RateLimitError as e:
            return f"Rate limited - try again in {e.retry_after}s"

        except Exception as e:
            return f"Unexpected error: {str(e)}"`}</code>
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
          <Link href="/docs/integrations/autogen" className="text-primary hover:underline">
            AutoGen Integration
          </Link>
        </li>
      </ul>
    </article>
  );
}
