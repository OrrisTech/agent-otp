import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AutoGen Integration',
  description: 'Integrate Agent OTP with Microsoft AutoGen for secure multi-agent conversations with permission controls.',
};

export default function AutoGenIntegrationPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1>AutoGen Integration</h1>

      <p className="lead text-xl text-muted-foreground">
        Add permission controls to Microsoft AutoGen conversations. Secure
        multi-agent interactions with human-in-the-loop approval.
      </p>

      <h2>Installation</h2>

      <pre className="language-bash">
        <code>{`pip install agent-otp pyautogen`}</code>
      </pre>

      <h2>Quick Start</h2>

      <p>
        Create OTP-protected functions for AutoGen agents:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp import AgentOTPClient
import autogen

otp = AgentOTPClient(api_key="ak_live_xxxx")

# Define protected function
def send_email_with_otp(recipient: str, subject: str, body: str) -> str:
    """Send an email with OTP protection."""
    permission = otp.request_permission(
        action="email.send",
        resource=f"email:{recipient}",
        scope={"max_emails": 1},
        context={
            "recipient": recipient,
            "subject": subject,
            "agent": "autogen_assistant"
        },
        wait_for_approval=True,
        timeout=120
    )

    if permission.status != "approved":
        return f"Email not sent: {permission.status}"

    # Send email (your implementation)
    result = _send_email(recipient, subject, body)

    otp.use_token(permission.id, permission.token)
    return f"Email sent to {recipient}"

# Configure agents
config_list = [{"model": "gpt-4", "api_key": "your-api-key"}]

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"config_list": config_list},
    system_message="You are a helpful assistant with email capabilities."
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={"work_dir": "workspace"}
)

# Register the protected function
user_proxy.register_function(
    function_map={
        "send_email": send_email_with_otp
    }
)

# Start conversation
user_proxy.initiate_chat(
    assistant,
    message="Send an email to john@example.com about tomorrow's meeting"
)`}</code>
      </pre>

      <h2>OTP Function Decorator</h2>

      <p>
        Use the decorator to protect AutoGen functions:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.autogen import otp_protected

@otp_protected(
    action="file.write",
    scope_builder=lambda path, content: {
        "max_size": len(content),
        "allowed_paths": [path]
    }
)
def write_file(path: str, content: str) -> str:
    """Write content to a file."""
    with open(path, "w") as f:
        f.write(content)
    return f"File written to {path}"

@otp_protected(
    action="api.call",
    require_approval=True  # Always require human approval
)
def call_external_api(url: str, payload: dict) -> str:
    """Make an external API call."""
    import requests
    response = requests.post(url, json=payload)
    return response.text

# Register protected functions
user_proxy.register_function(
    function_map={
        "write_file": write_file,
        "call_external_api": call_external_api
    }
)`}</code>
      </pre>

      <h2>GroupChat with Permissions</h2>

      <p>
        Add permission controls to group conversations:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.autogen import OTPGroupChatManager

# Create multiple agents
researcher = autogen.AssistantAgent(
    name="researcher",
    llm_config={"config_list": config_list},
    system_message="Research specialist"
)

writer = autogen.AssistantAgent(
    name="writer",
    llm_config={"config_list": config_list},
    system_message="Content writer"
)

executor = autogen.AssistantAgent(
    name="executor",
    llm_config={"config_list": config_list},
    system_message="Action executor with protected capabilities"
)

# Create group chat with OTP manager
groupchat = autogen.GroupChat(
    agents=[user_proxy, researcher, writer, executor],
    messages=[],
    max_round=20
)

# OTP-enabled manager that can control sensitive operations
manager = OTPGroupChatManager(
    groupchat=groupchat,
    llm_config={"config_list": config_list},
    otp_client=otp,
    protected_agents=["executor"],  # Monitor this agent's actions
    approval_required_actions=["email.send", "file.write", "api.call"]
)

user_proxy.initiate_chat(
    manager,
    message="Research AI trends and write a report, then email it to the team"
)`}</code>
      </pre>

      <h2>Code Execution Protection</h2>

      <p>
        Protect code execution with OTP:
      </p>

      <pre className="language-python">
        <code>{`from agent_otp.autogen import OTPCodeExecutor

# Create protected code executor
code_executor = OTPCodeExecutor(
    otp_client=otp,
    work_dir="workspace",
    allowed_languages=["python", "bash"],
    auto_approve_patterns=[
        r"^print\\(.*\\)$",  # Auto-approve simple prints
        r"^import (pandas|numpy)",  # Auto-approve safe imports
    ],
    deny_patterns=[
        r"subprocess",  # Deny subprocess calls
        r"os\\.system",  # Deny system calls
        r"eval\\(",  # Deny eval
    ]
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    code_execution_config={
        "executor": code_executor
    }
)

# Code execution will require OTP approval unless auto-approved
user_proxy.initiate_chat(
    assistant,
    message="Write a Python script to analyze the sales data"
)`}</code>
      </pre>

      <h2>Conversation Hooks</h2>

      <p>
        Add OTP checks at conversation boundaries:
      </p>

      <pre className="language-python">
        <code>{`class OTPAssistant(autogen.AssistantAgent):
    def __init__(self, otp_client, **kwargs):
        super().__init__(**kwargs)
        self.otp = otp_client
        self._message_count = 0

    def receive(self, message, sender, request_reply=None, silent=False):
        self._message_count += 1

        # Check if action needs approval
        if self._requires_approval(message):
            permission = self.otp.request_permission(
                action="conversation.sensitive",
                scope={"message_count": self._message_count},
                context={
                    "message_preview": message[:200] if isinstance(message, str) else str(message)[:200],
                    "sender": sender.name
                },
                wait_for_approval=True
            )

            if permission.status != "approved":
                return f"Action not approved: {permission.reason}"

        return super().receive(message, sender, request_reply, silent)

    def _requires_approval(self, message):
        # Define your logic for when approval is needed
        sensitive_keywords = ["delete", "execute", "send", "transfer"]
        if isinstance(message, str):
            return any(kw in message.lower() for kw in sensitive_keywords)
        return False`}</code>
      </pre>

      <h2>Two-Agent Conversations</h2>

      <pre className="language-python">
        <code>{`from agent_otp.autogen import OTPConversation

# Create a protected conversation
conversation = OTPConversation(
    otp_client=otp,
    agents=[assistant, user_proxy],
    permissions_required_for=["function_call", "code_execution"],
    max_auto_replies=5
)

# Start with automatic permission management
result = conversation.start(
    initial_message="Help me process and analyze the customer data",
    on_permission_required=lambda info: print(f"Approval needed: {info.approval_url}")
)`}</code>
      </pre>

      <h2>Policy Configuration</h2>

      <pre className="language-yaml">
        <code>{`# Auto-approve safe AutoGen operations
- name: "AutoGen safe operations"
  conditions:
    action:
      in: ["conversation.continue", "code.read"]
    context.agent:
      matches: "autogen_.*"
  action: auto_approve

# Require approval for code execution
- name: "AutoGen code execution"
  conditions:
    action:
      equals: "code.execute"
    context.agent:
      matches: "autogen_.*"
  action: require_approval
  scope_template:
    max_execution_time: 30
    allowed_languages: ["python"]

# Deny dangerous patterns
- name: "AutoGen dangerous patterns"
  conditions:
    context.code_pattern:
      matches: "(subprocess|os\\.system|eval)"
  action: deny
  priority: 100`}</code>
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
          <Link href="/docs/integrations/custom" className="text-primary hover:underline">
            Custom Agent Integration
          </Link>
        </li>
      </ul>
    </article>
  );
}
