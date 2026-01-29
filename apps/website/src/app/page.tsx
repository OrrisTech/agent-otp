import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CodeExampleSection />
        <PricingSection />
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
            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-border/80">
              Now in public beta.{' '}
              <Link href="/blog/launch" className="font-semibold text-primary">
                <span className="absolute inset-0" aria-hidden="true" />
                Read the announcement <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            One-Time Permissions for AI Agents
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Secure your AI agents with scoped, ephemeral, and human-approved access to sensitive operations.
            Simple SDK integration, powerful policy engine, real-time approval workflow.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/docs">
                View Documentation <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Free tier available
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Open source SDK
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              5 min setup
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    name: 'Scoped Permissions',
    description:
      'Define granular scopes for each operation. Limit actions to specific resources, amounts, or patterns.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: 'Ephemeral Tokens',
    description:
      'Tokens expire automatically after use or timeout. No persistent credentials to manage or rotate.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Human-in-the-Loop',
    description:
      'Require approval for sensitive operations. Get notified via Telegram, email, or webhook.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    name: 'Policy Engine',
    description:
      'Configure rules to auto-approve safe operations or require human review for risky ones.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    name: 'Full Audit Trail',
    description:
      'Every permission request, approval, and usage is logged. Export logs for compliance.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    name: 'Framework Agnostic',
    description:
      'Works with LangChain, CrewAI, AutoGen, or any custom agent. TypeScript and Python SDKs.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Security First</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to secure AI agents
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Built for the era of autonomous AI agents. Give your agents exactly the permissions they need,
            exactly when they need them.
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
    step: '01',
    title: 'Install the SDK',
    description: 'Add the Agent OTP SDK to your project with npm or bun.',
  },
  {
    step: '02',
    title: 'Request Permission',
    description: 'When your agent needs to perform a sensitive operation, request a one-time permission.',
  },
  {
    step: '03',
    title: 'Approve or Auto-Approve',
    description: 'Based on your policies, the request is auto-approved or sent for human review.',
  },
  {
    step: '04',
    title: 'Use the Token',
    description: 'Execute the operation with the scoped, ephemeral token. It expires after use.',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Simple Integration</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Get started in minutes. Our SDK handles the complexity so you can focus on building.
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
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
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
  const codeExample = `import { AgentOTPClient } from '@orrisai/agent-otp-sdk';

const otp = new AgentOTPClient({
  apiKey: process.env.AGENT_OTP_KEY,
});

// Request permission for a sensitive operation
const permission = await otp.requestPermission({
  action: 'gmail.send',
  resource: 'email:client@example.com',
  scope: {
    max_emails: 1,
    subject_pattern: '^Invoice.*',
  },
  context: {
    reason: 'Sending monthly invoice',
  },
  waitForApproval: true, // Blocks until approved
});

if (permission.status === 'approved') {
  // Use the one-time token
  await sendEmail({ otpToken: permission.token });
}`;

  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-base font-semibold leading-7 text-primary">Developer Experience</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Clean, intuitive API
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Our SDK is designed to be simple and predictable. Request permissions, wait for approval,
              use the token. That&apos;s it.
            </p>
            <dl className="mt-10 max-w-xl space-y-6 text-base leading-7 text-muted-foreground lg:max-w-none">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">TypeScript</span>
                  <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </dt>
                <dd>Full TypeScript support with complete type definitions</dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </dt>
                <dd>Async/await with built-in timeout handling</dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </dt>
                <dd>Detailed error messages with actionable suggestions</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl bg-background border border-border overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-2 text-sm text-muted-foreground">example.ts</span>
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

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '/signup',
    price: '$0',
    description: 'Perfect for hobby projects and experimentation.',
    features: [
      '1 agent',
      '100 requests/month',
      'Basic policies',
      'Email notifications',
      'Community support',
    ],
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/signup?plan=pro',
    price: '$29',
    description: 'For individuals and small teams building serious applications.',
    features: [
      '10 agents',
      '10,000 requests/month',
      'Advanced policies',
      'Telegram + webhook notifications',
      'Priority support',
      'Custom TTL settings',
    ],
    featured: true,
  },
  {
    name: 'Team',
    id: 'tier-team',
    href: '/signup?plan=team',
    price: '$99',
    description: 'For growing teams with multiple agents and workflows.',
    features: [
      'Unlimited agents',
      '100,000 requests/month',
      'Policy templates',
      'Team management',
      'SSO integration',
      'Audit log export',
      'SLA guarantee',
    ],
    featured: false,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-2xl p-8 ring-1 ${
                tier.featured
                  ? 'bg-primary/5 ring-primary shadow-lg scale-105'
                  : 'ring-border bg-background'
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold leading-8">{tier.name}</h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <p className="mt-6 text-sm text-muted-foreground">{tier.description}</p>
                <ul role="list" className="mt-8 space-y-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg
                        className="h-6 w-5 flex-none text-primary"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={tier.featured ? 'default' : 'outline'}
                className="mt-8 w-full"
                asChild
              >
                <Link href={tier.href}>Get started</Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Need enterprise features?{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact us
            </Link>{' '}
            for custom pricing.
          </p>
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
            Ready to secure your AI agents?
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
            Join hundreds of developers building secure, trustworthy AI applications.
            Get started in minutes with our free tier.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Start Building Free</Link>
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
    </section>
  );
}
