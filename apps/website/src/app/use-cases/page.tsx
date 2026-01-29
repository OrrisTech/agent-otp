import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'Discover how Agent OTP secures AI agents across different industries and applications. From email automation to financial operations.',
};

const useCases = [
  {
    title: 'Email Automation',
    description:
      'Secure your AI agents that send emails on your behalf. Control who they can email, what subjects they can use, and require approval for sensitive communications.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    features: [
      'Restrict recipients to whitelisted domains',
      'Require approval for external emails',
      'Limit daily email volume',
      'Audit all sent communications',
    ],
    example: `await otp.requestPermission({
  action: 'email.send',
  resource: 'email:client@example.com',
  scope: {
    max_emails: 1,
    subject_pattern: '^Invoice.*',
  },
});`,
  },
  {
    title: 'Financial Operations',
    description:
      'Add human oversight to AI agents handling payments, transfers, and financial data. Set limits, require multi-level approval, and maintain compliance.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    features: [
      'Set transaction amount limits',
      'Require approval above thresholds',
      'Restrict to specific accounts',
      'Complete audit trail for compliance',
    ],
    example: `await otp.requestPermission({
  action: 'bank.transfer',
  resource: 'account:checking',
  scope: {
    max_amount: 1000,
    currency: 'USD',
  },
  context: {
    reason: 'Vendor payment',
  },
});`,
  },
  {
    title: 'File System Access',
    description:
      'Control what files your AI agents can read, write, or delete. Restrict access to specific directories, file types, and sizes.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    features: [
      'Restrict to specific directories',
      'Limit file size operations',
      'Allow only certain file types',
      'Auto-approve reads, require approval for writes',
    ],
    example: `await otp.requestPermission({
  action: 'file.write',
  resource: 'path:/data/reports',
  scope: {
    max_size: 10485760, // 10MB
    allowed_extensions: ['.pdf', '.csv'],
  },
});`,
  },
  {
    title: 'Database Operations',
    description:
      'Protect your databases from unintended modifications. Control what queries can be executed, which tables can be accessed, and how much data can be affected.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    features: [
      'Restrict to read-only or specific operations',
      'Limit affected row counts',
      'Require approval for DDL statements',
      'Whitelist specific tables',
    ],
    example: `await otp.requestPermission({
  action: 'db.query',
  resource: 'table:users',
  scope: {
    operations: ['SELECT'],
    max_rows: 1000,
  },
});`,
  },
  {
    title: 'API Integrations',
    description:
      'Secure third-party API calls made by your agents. Control rate limits, endpoints, and data exposure when interacting with external services.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    features: [
      'Whitelist allowed endpoints',
      'Rate limit API calls',
      'Restrict HTTP methods',
      'Mask sensitive response data',
    ],
    example: `await otp.requestPermission({
  action: 'api.call',
  resource: 'api:stripe.com',
  scope: {
    endpoints: ['/v1/charges'],
    methods: ['POST'],
    rate_limit: 10, // per minute
  },
});`,
  },
  {
    title: 'Code Execution',
    description:
      'For agents that can execute code or run commands, add safety controls. Sandbox environments, restrict commands, and require approval for system changes.',
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    features: [
      'Whitelist allowed commands',
      'Restrict execution environments',
      'Set resource limits (CPU, memory)',
      'Require approval for system modifications',
    ],
    example: `await otp.requestPermission({
  action: 'shell.execute',
  resource: 'env:sandbox',
  scope: {
    allowed_commands: ['ls', 'cat', 'grep'],
    max_runtime: 30000, // 30 seconds
  },
});`,
  },
];

export default function UseCasesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Use Cases
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Agent OTP secures AI agents across industries and applications.
                See how teams are using scoped, ephemeral permissions to build
                trustworthy AI systems.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="pb-20 sm:pb-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="space-y-20">
              {useCases.map((useCase, index) => (
                <div
                  key={useCase.title}
                  className={`flex flex-col gap-12 lg:flex-row ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className="lg:w-1/2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {useCase.icon}
                      </div>
                      <h2 className="text-2xl font-bold">{useCase.title}</h2>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      {useCase.description}
                    </p>
                    <ul className="space-y-3">
                      {useCase.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <svg
                            className="h-5 w-5 flex-none text-primary mt-0.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="lg:w-1/2">
                    <div className="rounded-xl border border-border bg-background overflow-hidden shadow-lg">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          example.ts
                        </span>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm">
                        <code className="text-foreground">{useCase.example}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-32 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to secure your AI agents?
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Start with our free tier and scale as your needs grow.
                Full SDK access, no credit card required.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button size="lg" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/docs">Read the Docs</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
