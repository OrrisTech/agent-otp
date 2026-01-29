'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';

const docsNavigation = [
  {
    title: 'Getting Started',
    links: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quick Start', href: '/docs/quickstart' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Configuration', href: '/docs/configuration' },
    ],
  },
  {
    title: 'Core Concepts',
    links: [
      { title: 'Permissions', href: '/docs/concepts/permissions' },
      { title: 'Tokens', href: '/docs/concepts/tokens' },
      { title: 'Policies', href: '/docs/concepts/policies' },
      { title: 'Scopes', href: '/docs/concepts/scopes' },
    ],
  },
  {
    title: 'SDK Reference',
    links: [
      { title: 'TypeScript SDK', href: '/docs/sdk/typescript' },
      { title: 'Python SDK', href: '/docs/sdk/python' },
      { title: 'Error Handling', href: '/docs/sdk/errors' },
    ],
  },
  {
    title: 'API Reference',
    links: [
      { title: 'Authentication', href: '/docs/api/authentication' },
      { title: 'Permissions API', href: '/docs/api/permissions' },
      { title: 'Policies API', href: '/docs/api/policies' },
      { title: 'Agents API', href: '/docs/api/agents' },
      { title: 'Audit API', href: '/docs/api/audit' },
    ],
  },
  {
    title: 'Integrations',
    links: [
      { title: 'LangChain', href: '/docs/integrations/langchain' },
      { title: 'CrewAI', href: '/docs/integrations/crewai' },
      { title: 'AutoGen', href: '/docs/integrations/autogen' },
      { title: 'Custom Agents', href: '/docs/integrations/custom' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { title: 'Policy Best Practices', href: '/docs/guides/policies' },
      { title: 'Telegram Bot Setup', href: '/docs/guides/telegram' },
      { title: 'Self-Hosting', href: '/docs/guides/self-hosting' },
      { title: 'Security', href: '/docs/guides/security' },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 mx-auto w-full max-w-8xl lg:flex">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:border-r lg:border-border">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto py-8 pl-8 pr-6">
            <nav className="space-y-8">
              {docsNavigation.map((section) => (
                <div key={section.title}>
                  <h3 className="font-semibold text-sm text-foreground">
                    {section.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            'block text-sm transition-colors',
                            pathname === link.href
                              ? 'text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 py-8 px-6 lg:px-12">
          <div className="mx-auto max-w-3xl">
            {children}
          </div>
        </main>

        {/* Table of contents placeholder */}
        <aside className="hidden xl:block xl:w-56 xl:flex-shrink-0">
          <div className="sticky top-20 py-8 pr-8">
            {/* TOC would be dynamically generated from content */}
          </div>
        </aside>
      </div>
      <Footer />
    </div>
  );
}
