import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for Agent OTP. Start free, scale as you grow. No hidden fees, no surprises.',
};

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '/signup',
    price: { monthly: '$0', yearly: '$0' },
    description: 'Perfect for hobby projects and experimentation.',
    features: [
      '1 agent',
      '100 requests/month',
      'Basic policies',
      'Email notifications',
      'Community support',
      '24-hour data retention',
    ],
    limitations: [
      'No Telegram notifications',
      'No webhooks',
      'No team features',
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '/signup?plan=pro',
    price: { monthly: '$29', yearly: '$290' },
    description: 'For individuals and small teams building serious applications.',
    features: [
      '10 agents',
      '10,000 requests/month',
      'Advanced policies',
      'Telegram + webhook notifications',
      'Priority email support',
      'Custom TTL settings (up to 1 hour)',
      '30-day data retention',
      'Basic audit log export',
    ],
    limitations: [],
    cta: 'Start Pro Trial',
    featured: true,
  },
  {
    name: 'Team',
    id: 'tier-team',
    href: '/signup?plan=team',
    price: { monthly: '$99', yearly: '$990' },
    description: 'For growing teams with multiple agents and workflows.',
    features: [
      'Unlimited agents',
      '100,000 requests/month',
      'Policy templates library',
      'All notification channels',
      'Priority support with SLA',
      'Team management & roles',
      'SSO integration (SAML, OIDC)',
      '90-day data retention',
      'Full audit log export',
      'Custom domains',
    ],
    limitations: [],
    cta: 'Start Team Trial',
    featured: false,
  },
];

const enterprise = {
  name: 'Enterprise',
  description:
    'For organizations with advanced security, compliance, and scale requirements.',
  features: [
    'Unlimited everything',
    'Custom request limits',
    'Self-hosted deployment option',
    'Dedicated support engineer',
    'Custom SLA (up to 99.99%)',
    'SOC 2 Type II compliance',
    'HIPAA BAA available',
    'Custom data retention',
    'Advanced analytics',
    'Professional services',
  ],
};

const faqs = [
  {
    question: 'What counts as a request?',
    answer:
      'A request is any permission request made through the SDK. Verification and usage calls are free and don\'t count toward your limit.',
  },
  {
    question: 'Can I switch plans at any time?',
    answer:
      'Yes, you can upgrade or downgrade at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the new rate applies at the next billing cycle.',
  },
  {
    question: 'What happens if I exceed my request limit?',
    answer:
      'We\'ll notify you when you reach 80% of your limit. If you exceed it, requests will be queued until the next billing cycle or until you upgrade. We never reject requests without warning.',
  },
  {
    question: 'Do you offer a free trial for paid plans?',
    answer:
      'Yes, Pro and Team plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer:
      'Yes, annual billing saves you approximately 17% compared to monthly billing (2 months free).',
  },
  {
    question: 'Can I self-host Agent OTP?',
    answer:
      'Self-hosting is available on Enterprise plans. The SDK is open source, and we provide Docker images and Kubernetes charts for deployment.',
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Start free, scale as you grow. No hidden fees, no surprises.
                All plans include the full SDK and core features.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-2xl p-8 ring-1 ${
                    tier.featured
                      ? 'bg-primary/5 ring-primary shadow-xl scale-105 relative'
                      : 'ring-border bg-background'
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold leading-8">{tier.name}</h3>
                    <p className="mt-4 flex items-baseline gap-x-2">
                      <span className="text-4xl font-bold tracking-tight">
                        {tier.price.monthly}
                      </span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      or {tier.price.yearly}/year (save 17%)
                    </p>
                    <p className="mt-6 text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                    <ul role="list" className="mt-8 space-y-3 text-sm">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                          <svg
                            className="h-5 w-5 flex-none text-primary"
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
                      {tier.limitations.map((limitation) => (
                        <li
                          key={limitation}
                          className="flex gap-x-3 text-muted-foreground"
                        >
                          <svg
                            className="h-5 w-5 flex-none"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                          </svg>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant={tier.featured ? 'default' : 'outline'}
                    className="mt-8 w-full"
                    size="lg"
                    asChild
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-20 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-4xl rounded-2xl bg-background p-8 ring-1 ring-border lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <h2 className="text-2xl font-bold">{enterprise.name}</h2>
                  <p className="mt-4 text-muted-foreground max-w-xl">
                    {enterprise.description}
                  </p>
                  <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                    {enterprise.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <svg
                          className="h-5 w-5 flex-none text-primary"
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
                <div className="flex flex-col items-center lg:items-end gap-4">
                  <span className="text-2xl font-bold">Custom Pricing</span>
                  <Button size="lg" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                Frequently asked questions
              </h2>
              <dl className="space-y-8">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="text-base font-semibold leading-7">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-sm leading-7 text-muted-foreground">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-32 bg-primary">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-6 text-lg leading-8 text-primary-foreground/80">
                Start with our free tier—no credit card required. Upgrade
                anytime as your needs grow.
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
                  <Link href="/contact">Talk to Sales</Link>
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
