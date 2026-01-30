import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/newsletter-form";

const GITHUB_URL = "https://github.com/orristech/agent-otp";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CodeExampleSection />
        <OpenSourceSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.12),transparent)]" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-primary/50 transition-colors"
            >
              Open source on GitHub{" "}
              <span className="font-semibold text-primary">
                Star us <span aria-hidden="true">&rarr;</span>
              </span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Secure OTP Relay for AI Agents
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Help your AI agents receive verification codes securely.
            End-to-end encrypted. User approved. Auto-deleted after use.
            Never give your agent direct access to SMS or email again.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                View on GitHub
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/docs">
                Documentation <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              E2E Encrypted
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              SMS &amp; Email
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Self-hostable
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    name: "End-to-End Encrypted",
    description:
      "OTPs are encrypted on your device with the agent's public key. Only the authorized agent can decrypt them. Even we can't read your codes.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    name: "One-Time Read",
    description:
      "OTP codes are automatically deleted after your agent reads them. No data retention, no persistent storage of sensitive codes.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: "User Approval",
    description:
      "You control which OTPs your agents can access. Approve each request in real-time via Telegram, email, or the dashboard.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    name: "Multi-Source Capture",
    description:
      "Capture OTPs from SMS (Android app), Email (Gmail/IMAP), and more. One unified API for all verification codes.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    name: "Full Audit Trail",
    description:
      "Every OTP request and access is logged. See exactly what your agents accessed and when. Export logs for compliance.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: "Framework Agnostic",
    description:
      "Works with LangChain, CrewAI, AutoGen, or any custom agent. TypeScript and Python SDKs available.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Security First
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            OTP relay designed for AI agents
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Your agents need verification codes. You need security and control.
            Agent OTP bridges the gap with end-to-end encryption and user approval.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    title: "Install the App",
    description: "Download Agent OTP on your Android phone or connect your email account for OTP capture.",
  },
  {
    step: "02",
    title: "Agent Requests OTP",
    description:
      "When your agent needs a verification code, it requests access through the SDK with the reason.",
  },
  {
    step: "03",
    title: "You Approve",
    description:
      "Get notified via Telegram or email. Approve which OTP to share with your agent.",
  },
  {
    step: "04",
    title: "Agent Gets Code",
    description:
      "The encrypted OTP is securely delivered to your agent. Deleted after reading.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Simple Integration
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Get started in minutes. Our SDK handles the complexity so you can
            focus on building.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-8 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative flex flex-col items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeExampleSection() {
  const codeExample = `import {
  AgentOTPClient,
  generateKeyPair,
  exportPublicKey
} from '@orrisai/agent-otp-sdk';

const client = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_API_KEY!,
});

// Generate encryption keys (store private key securely)
const { publicKey, privateKey } = await generateKeyPair();

// Request an OTP
const request = await client.requestOTP({
  reason: 'Sign up verification for Acme Inc',
  expectedSender: 'Acme',
  filter: {
    sources: ['email'],
    senderPattern: '*@acme.com',
  },
  publicKey: await exportPublicKey(publicKey),
  waitForOTP: true,
});

// Consume the OTP (one-time read, then deleted)
if (request.status === 'otp_received') {
  const { code } = await client.consumeOTP(request.id, privateKey);
  await completeSignup(code);
}`;

  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-base font-semibold leading-7 text-primary">
              Developer Experience
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Clean, intuitive API
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our SDK handles encryption, polling, and error handling.
              Request an OTP, wait for it, decrypt and use it. Simple.
            </p>
            <dl className="mt-10 max-w-xl space-y-6 text-base leading-7 text-muted-foreground lg:max-w-none">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">TypeScript</span>
                  <svg
                    className="h-7 w-7 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </dt>
                <dd>Built-in E2E encryption with Web Crypto API</dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <svg
                    className="h-7 w-7 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </dt>
                <dd>Async/await with built-in polling and timeout handling</dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <svg
                    className="h-7 w-7 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </dt>
                <dd>Detailed error classes for every failure mode</dd>
              </div>
            </dl>
            <div className="mt-10">
              <Button asChild>
                <Link href="/docs/installation">
                  Get Started <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-background border border-border overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-muted-foreground">
                agent.ts
              </span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm">
              <code className="text-foreground">{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function OpenSourceSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Open Source
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Built in the open, for the community
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Agent OTP is fully open source under the MIT license. Self-host it,
            contribute to it, or use it as a foundation for your own security
            infrastructure.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold">Contribute</h3>
              <p className="mt-2 text-muted-foreground">
                Found a bug? Have a feature idea? PRs and issues are welcome.
                Join our community of contributors.
              </p>
              <Link
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                View on GitHub{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold">Self-Host</h3>
              <p className="mt-2 text-muted-foreground">
                Deploy on your own infrastructure. Full control over your data
                with Docker and Kubernetes support.
              </p>
              <Link
                href="/docs/guides/self-hosting"
                className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Self-hosting guide{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-background p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold">MIT License</h3>
              <p className="mt-2 text-muted-foreground">
                Use it commercially, modify it freely, and distribute it as you
                wish. No strings attached.
              </p>
              <Link
                href={`${GITHUB_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                View license{" "}
                <span aria-hidden="true" className="ml-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 sm:py-32 bg-primary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Stay updated on Agent OTP
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
            Get notified about new releases, features, and security updates.
            Join our newsletter for the latest on AI agent security.
          </p>
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="w-full max-w-md">
              <NewsletterForm variant="hero" />
            </div>
            <div className="flex items-center gap-x-6">
              <Button size="lg" variant="secondary" asChild>
                <Link
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Star on GitHub
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link href="/docs">
                  Read the Docs <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
