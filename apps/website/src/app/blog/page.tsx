import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NewsletterForm } from '@/components/newsletter-form';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Articles, tutorials, and updates about Agent OTP, AI agent security, and building trustworthy AI systems.',
};

const posts = [
  {
    id: 'launch',
    title: 'Introducing Agent OTP: One-Time Permissions for AI Agents',
    description:
      'Today we\'re launching Agent OTP, a lightweight service that provides scoped, ephemeral permissions for AI agents. Learn why we built it and how it works.',
    date: '2026-01-28',
    category: 'Announcement',
    readTime: '5 min read',
  },
  {
    id: 'why-agent-security-matters',
    title: 'Why AI Agent Security Matters More Than Ever',
    description:
      'As AI agents become more autonomous, the security challenges they present grow exponentially. Here\'s what you need to know to build secure, trustworthy AI systems.',
    date: '2026-01-25',
    category: 'Security',
    readTime: '8 min read',
  },
  {
    id: 'policy-best-practices',
    title: 'Best Practices for Agent Permission Policies',
    description:
      'Learn how to design effective permission policies that balance security with usability. From auto-approval rules to human-in-the-loop workflows.',
    date: '2026-01-20',
    category: 'Tutorial',
    readTime: '10 min read',
  },
  {
    id: 'langchain-integration',
    title: 'Integrating Agent OTP with LangChain',
    description:
      'A step-by-step guide to adding one-time permissions to your LangChain agents. Secure your tools and chain operations with minimal code changes.',
    date: '2026-01-15',
    category: 'Tutorial',
    readTime: '12 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Articles, tutorials, and updates about Agent OTP, AI agent security,
              and building trustworthy AI systems.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col items-start rounded-2xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.date} className="text-muted-foreground">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span className="relative z-10 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary">
                    {post.category}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-4 text-lg font-semibold leading-6 group-hover:text-primary">
                    <Link href={`/blog/${post.id}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground line-clamp-3">
                    {post.description}
                  </p>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {post.readTime}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground">
              More articles coming soon. Subscribe to our newsletter to stay updated.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
