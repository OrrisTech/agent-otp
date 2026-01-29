import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://agentotp.com';

  // Static pages
  const staticPages = [
    '',
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
    '/use-cases',
    '/pricing',
    '/blog',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/security',
  ];

  // Blog posts (would be dynamically generated in production)
  const blogPosts = [
    '/blog/launch',
    '/blog/why-agent-security-matters',
    '/blog/policy-best-practices',
    '/blog/langchain-integration',
  ];

  const allPages = [...staticPages, ...blogPosts];

  return allPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith('/blog')
      ? 'weekly'
      : route.startsWith('/docs')
        ? 'weekly'
        : 'monthly',
    priority: route === '' ? 1 : route.startsWith('/docs') ? 0.8 : 0.6,
  }));
}
