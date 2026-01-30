import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://agentotp.com';
  const lastModified = new Date('2026-01-30');

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/use-cases', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  // Documentation pages
  const docPages = [
    '/docs',
    '/docs/quickstart',
    '/docs/installation',
    '/docs/configuration',
    '/docs/concepts/permissions',
    '/docs/concepts/tokens',
    '/docs/concepts/policies',
    '/docs/concepts/scopes',
    '/docs/sdk/typescript',
    '/docs/sdk/python',
    '/docs/sdk/errors',
    '/docs/api/authentication',
    '/docs/api/permissions',
    '/docs/api/policies',
    '/docs/api/agents',
    '/docs/api/audit',
    '/docs/integrations/langchain',
    '/docs/integrations/crewai',
    '/docs/integrations/autogen',
    '/docs/integrations/custom',
    '/docs/guides/policies',
    '/docs/guides/telegram',
    '/docs/guides/self-hosting',
    '/docs/guides/security',
  ];

  const entries: MetadataRoute.Sitemap = [
    // Static pages with custom priorities
    ...staticPages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),

    // Documentation pages
    ...docPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: path === '/docs' ? 0.9 : 0.8,
    })),
  ];

  return entries;
}
