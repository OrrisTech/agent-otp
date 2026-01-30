import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LangChain Integration',
  description: 'Integrate Agent OTP with LangChain to add one-time permissions to your LangChain agents and tools.',
};

export default function LangChainIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>LangChain Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Add one-time permissions to your LangChain agents. Protect sensitive
        tools with human-in-the-loop approval.
      </p>

      <h2>Installation</h2>

      <pre className="language-bash">
        <code>{`pip install agent-otp langchain langchain-openai`}</code>
      </pre>

      <h2>Quick Start</h2>

      <p>
        Wrap your LangChain tools with OTP protection:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient
from langchain.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import ChatPromptTemplate

# Initialize OTP client
otp = AgentOTPClient(api_key="ak_live_xxxx")

class OTPProtectedEmailTool(BaseTool):
    name = "send_email"
    description = "Send an email to a recipient. Requires approval."

    def _run(self, recipient: str, subject: str, body: str) -> str:
        # Request permission
        permission = otp.request_permission(
            action="email.send",
            resource=f"email:{recipient}",
            scope={"max_emails": 1},
            context={
                "recipient": recipient,
                "subject": subject,
                "reason": "Agent sending email on behalf of user"
            },
            wait_for_approval=True,
            timeout=120
        )

        if permission.status != "approved":
            return f"Email not sent: {permission.status} - {permission.reason}"

        # Send email (your implementation)
        result = self._send_email(recipient, subject, body)

        # Mark token as used
        otp.use_token(permission.id, permission.token, {
            "recipient": recipient,
            "subject": subject
        })

        return f"Email sent successfully to {recipient}"

    def _send_email(self, recipient: str, subject: str, body: str):
        # Your email sending implementation
        pass

# Create agent
tools = [OTPProtectedEmailTool()]
llm = ChatOpenAI(model="gpt-4")
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run
result = agent_executor.invoke({
    "input": "Send an email to john@example.com about the meeting tomorrow"
})`}</code>
      </pre>

      <h2>OTP Tool Decorator</h2>

      <p>
        Use the decorator for cleaner code:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.langchain import otp_protected
from langchain.tools import tool

@tool
@otp_protected(
    action="file.write",
    scope_builder=lambda path, content: {
        "max_size": len(content),
        "allowed_paths": [path]
    }
)
def write_file(path: str, content: str) -> str:
    """Write content to a file. Requires approval."""
    with open(path, "w") as f:
        f.write(content)
    return f"File written to {path}"

@tool
@otp_protected(
    action="database.query",
    auto_use_token=True  # Automatically mark token as used
)
def execute_sql(query: str) -> str:
    """Execute a SQL query. Requires approval for destructive operations."""
    # Implementation
    pass`}</code>
      </pre>

      <h2>Custom Approval Handler</h2>

      <p>
        Handle pending approvals in your agent:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.langchain import OTPToolkit

class CustomOTPToolkit(OTPToolkit):
    def on_pending_approval(self, info):
        """Called when human approval is needed."""
        print(f"Waiting for approval: {info.approval_url}")

        # Optionally notify user via your preferred channel
        self.notify_user(
            f"Your agent needs approval to {info.action}. "
            f"Approve here: {info.approval_url}"
        )

    def notify_user(self, message: str):
        # Your notification implementation
        pass

toolkit = CustomOTPToolkit(api_key="ak_live_xxxx")
protected_tools = toolkit.wrap_tools(tools)`}</code>
      </pre>

      <h2>LangGraph Integration</h2>

      <p>
        Use with LangGraph for more complex workflows:
      </p>

      <pre className="language-python">
        <code>{`from langgraph.graph import StateGraph, END
from agent_otp import AgentOTPClient

otp = AgentOTPClient(api_key="ak_live_xxxx")

def request_permission_node(state):
    """Node that requests OTP permission."""
    permission = otp.request_permission(
        action=state["action"],
        scope=state["scope"],
        context=state["context"],
        wait_for_approval=False  # Don't block
    )

    return {
        **state,
        "permission_id": permission.id,
        "permission_status": permission.status,
        "approval_url": permission.approval_url
    }

def check_approval_node(state):
    """Node that checks approval status."""
    permission = otp.get_permission(state["permission_id"])
    return {**state, "permission_status": permission.status}

def execute_action_node(state):
    """Node that executes the protected action."""
    if state["permission_status"] != "approved":
        return {**state, "result": "Permission not granted"}

    # Execute the protected action
    result = execute_action(state)

    # Mark token as used
    otp.use_token(state["permission_id"], state["token"])

    return {**state, "result": result}

# Build graph
graph = StateGraph()
graph.add_node("request_permission", request_permission_node)
graph.add_node("check_approval", check_approval_node)
graph.add_node("execute_action", execute_action_node)

graph.set_entry_point("request_permission")
graph.add_conditional_edges(
    "request_permission",
    lambda s: "execute" if s["permission_status"] == "approved" else "wait",
    {"execute": "execute_action", "wait": "check_approval"}
)
graph.add_conditional_edges(
    "check_approval",
    lambda s: "execute" if s["permission_status"] == "approved" else "wait",
    {"execute": "execute_action", "wait": "check_approval"}
)
graph.add_edge("execute_action", END)`}</code>
      </pre>

      <h2>Policy Examples</h2>

      <p>
        Configure policies for your LangChain agents:
      </p>

      <pre className="language-yaml">
        <code>{`# Auto-approve read operations
- name: "Auto-approve LangChain reads"
  conditions:
    action:
      starts_with: "file.read"
    context.agent_type:
      equals: "langchain"
  action: auto_approve
  scope_template:
    max_size: 1048576

# Require approval for writes
- name: "LangChain write operations"
  conditions:
    action:
      starts_with: "file.write"
    context.agent_type:
      equals: "langchain"
  action: require_approval

# Deny dangerous operations
- name: "Block dangerous operations"
  conditions:
    action:
      in: ["system.exec", "database.drop"]
  action: deny
  priority: 100`}</code>
      </pre>

      <h2>Streaming Support</h2>

      <p>
        Handle permissions with streaming agents:
      </p>

      <pre className="language-python">
        <code>{`async def stream_with_otp():
    async for event in agent_executor.astream_events(
        {"input": "Send an email about the project update"},
        version="v1"
    ):
        if event["event"] == "on_tool_start":
            tool_name = event["name"]
            if tool_name == "send_email":
                print("Requesting permission for email...")

        elif event["event"] == "on_tool_end":
            print(f"Tool completed: {event['data']['output']}")

        elif event["event"] == "on_chat_model_stream":
            print(event["data"]["chunk"].content, end="")`}</code>
      </pre>

      <h2>Error Handling</h2>

      <pre className="language-python">
        <code>{`from agent_otp import (
    PermissionDeniedError,
    TokenExpiredError,
    RateLimitError
)

class RobustOTPTool(BaseTool):
    name = "protected_action"
    description = "A tool with robust error handling"

    def _run(self, **kwargs) -> str:
        try:
            permission = otp.request_permission(
                action="action.name",
                scope={},
                wait_for_approval=True,
                timeout=60
            )

            if permission.status == "approved":
                result = self._execute(permission.token, **kwargs)
                otp.use_token(permission.id, permission.token)
                return result
            else:
                return f"Action not permitted: {permission.reason}"

        except PermissionDeniedError as e:
            return f"Permission denied by policy: {e.reason}"
        except TokenExpiredError:
            return "Approval timeout - please try again"
        except RateLimitError as e:
            return f"Rate limited - retry in {e.retry_after}s"`}</code>
      </pre>

      <h2>See Also</h2>

      <ul>
        <li>
          <Link href="/docs/sdk/python" className="text-primary hover:underline">
            Python SDK Reference
          </Link>
        </li>
        <li>
          <Link href="/docs/integrations/crewai" className="text-primary hover:underline">
            CrewAI Integration
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
