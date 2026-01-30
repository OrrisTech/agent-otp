import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CrewAI Integration',
  description: 'Integrate Agent OTP with CrewAI to add one-time permissions to your AI crew members and tasks.',
};

export default function CrewAIIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>CrewAI Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Add permission controls to your CrewAI crews. Protect sensitive
        operations with human-in-the-loop approval.
      </p>

      <h2>Installation</h2>

      <pre className="language-bash">
        <code>{`pip install agent-otp crewai crewai-tools`}</code>
      </pre>

      <h2>Quick Start</h2>

      <p>
        Create OTP-protected tools for your CrewAI agents:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient
from crewai import Agent, Task, Crew
from crewai_tools import BaseTool

otp = AgentOTPClient(api_key="ak_live_xxxx")

class OTPProtectedEmailTool(BaseTool):
    name: str = "Send Email"
    description: str = "Sends an email to a recipient. Requires approval."

    def _run(self, recipient: str, subject: str, body: str) -> str:
        # Request permission
        permission = otp.request_permission(
            action="email.send",
            resource=f"email:{recipient}",
            scope={
                "max_emails": 1,
                "allowed_recipients": [recipient]
            },
            context={
                "recipient": recipient,
                "subject": subject,
                "agent": "crewai_email_agent"
            },
            wait_for_approval=True,
            timeout=120
        )

        if permission.status != "approved":
            return f"Email not sent: Permission {permission.status}"

        # Send email (your implementation)
        self._send_email(recipient, subject, body)

        # Mark token as used
        otp.use_token(permission.id, permission.token)

        return f"Email sent to {recipient}"

    def _send_email(self, recipient: str, subject: str, body: str):
        # Your email implementation
        pass

# Create agents with protected tools
email_tool = OTPProtectedEmailTool()

email_agent = Agent(
    role="Email Specialist",
    goal="Handle all email communications professionally",
    backstory="Expert at crafting and sending professional emails",
    tools=[email_tool],
    verbose=True
)

# Create task
email_task = Task(
    description="Send a follow-up email to john@example.com about the proposal",
    expected_output="Confirmation that email was sent",
    agent=email_agent
)

# Create and run crew
crew = Crew(
    agents=[email_agent],
    tasks=[email_task],
    verbose=True
)

result = crew.kickoff()`}</code>
      </pre>

      <h2>OTP Tool Wrapper</h2>

      <p>
        Use the wrapper to protect existing CrewAI tools:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.crewai import OTPToolWrapper
from crewai_tools import FileWriterTool, DirectorySearchTool

# Wrap existing tools
file_writer = FileWriterTool()
protected_file_writer = OTPToolWrapper(
    tool=file_writer,
    otp_client=otp,
    action="file.write",
    scope_builder=lambda **kwargs: {
        "max_size": 1048576,
        "allowed_paths": [kwargs.get("file_path", "/tmp")]
    }
)

# Use in agent
file_agent = Agent(
    role="File Manager",
    goal="Manage files safely with proper approvals",
    backstory="Careful file system manager",
    tools=[protected_file_writer]
)`}</code>
      </pre>

      <h2>Crew-Level Permissions</h2>

      <p>
        Request permissions at the crew level for batch operations:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.crewai import OTPCrew

class ProtectedCrew(OTPCrew):
    def __init__(self, **kwargs):
        super().__init__(
            otp_client=otp,
            **kwargs
        )

    def before_kickoff(self):
        """Request permission before crew starts."""
        permission = self.otp_client.request_permission(
            action="crew.execute",
            scope={
                "max_tasks": len(self.tasks),
                "allowed_agents": [a.role for a in self.agents]
            },
            context={
                "crew_name": "Research Crew",
                "task_descriptions": [t.description for t in self.tasks]
            },
            wait_for_approval=True
        )

        if permission.status != "approved":
            raise PermissionError("Crew execution not approved")

        self._permission = permission

    def after_kickoff(self, result):
        """Mark permission as used after completion."""
        self.otp_client.use_token(
            self._permission.id,
            self._permission.token,
            {"result_summary": str(result)[:500]}
        )

crew = ProtectedCrew(
    agents=[research_agent, writer_agent],
    tasks=[research_task, writing_task]
)
result = crew.kickoff()`}</code>
      </pre>

      <h2>Task-Level Permissions</h2>

      <p>
        Add OTP checks to specific tasks:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.crewai import otp_task

@otp_task(
    action="task.database_query",
    scope={"max_queries": 5, "allowed_tables": ["users", "orders"]}
)
def create_database_task():
    return Task(
        description="Query the database for user statistics",
        expected_output="Summary of user statistics",
        agent=data_agent
    )

# Or using the decorator on Task execution
class OTPTask(Task):
    def __init__(self, otp_action: str, otp_scope: dict, **kwargs):
        super().__init__(**kwargs)
        self.otp_action = otp_action
        self.otp_scope = otp_scope

    def execute(self, context=None):
        permission = otp.request_permission(
            action=self.otp_action,
            scope=self.otp_scope,
            context={"task": self.description},
            wait_for_approval=True
        )

        if permission.status != "approved":
            return f"Task not executed: {permission.reason}"

        result = super().execute(context)
        otp.use_token(permission.id, permission.token)
        return result`}</code>
      </pre>

      <h2>Hierarchical Crews</h2>

      <p>
        Handle permissions in manager/worker hierarchies:
      </p>

      <pre className="language-python">
        <code>{`# Manager can approve worker operations
manager_agent = Agent(
    role="Project Manager",
    goal="Coordinate team and approve sensitive operations",
    backstory="Experienced manager with approval authority",
    allow_delegation=True
)

# Workers request permissions through OTP
worker_agent = Agent(
    role="Data Analyst",
    goal="Analyze data and generate reports",
    backstory="Skilled analyst requiring approval for data access",
    tools=[protected_data_tool]
)

# Create hierarchical crew
crew = Crew(
    agents=[manager_agent, worker_agent],
    tasks=[analysis_task],
    process=Process.hierarchical,
    manager_agent=manager_agent
)`}</code>
      </pre>

      <h2>Policy Configuration</h2>

      <p>
        Configure policies for CrewAI operations:
      </p>

      <pre className="language-yaml">
        <code>{`# Auto-approve read-only operations
- name: "CrewAI read operations"
  conditions:
    action:
      in: ["file.read", "web.search", "database.select"]
    context.agent:
      matches: "crewai_.*"
  action: auto_approve

# Require approval for external communications
- name: "CrewAI external comms"
  conditions:
    action:
      in: ["email.send", "slack.post", "api.call"]
    context.agent:
      matches: "crewai_.*"
  action: require_approval

# Rate limit per crew execution
- name: "CrewAI rate limit"
  conditions:
    action:
      starts_with: "crew."
  action: auto_approve
  scope_template:
    max_operations_per_hour: 100`}</code>
      </pre>

      <h2>Async Crews</h2>

      <p>
        Use async patterns for non-blocking approval:
      </p>

      <pre className="language-python">
        <code>{`import asyncio
from agent_otp import AsyncAgentOTPClient

async_otp = AsyncAgentOTPClient(api_key="ak_live_xxxx")

class AsyncOTPTool(BaseTool):
    name: str = "Async Protected Tool"
    description: str = "Tool with async permission handling"

    async def _arun(self, **kwargs) -> str:
        permission = await async_otp.request_permission(
            action="async.operation",
            scope={},
            wait_for_approval=True
        )

        if permission.status == "approved":
            result = await self._async_operation(**kwargs)
            await async_otp.use_token(permission.id, permission.token)
            return result

        return "Operation not approved"

# Run async crew
async def run_async_crew():
    crew = Crew(agents=[...], tasks=[...])
    result = await crew.kickoff_async()
    return result

asyncio.run(run_async_crew())`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/sdk/python" className="text-primary hover:underline">
            Python SDK Reference
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
