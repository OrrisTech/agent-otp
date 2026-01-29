# Agent OTP - Release Guide

This document provides a comprehensive guide for releasing Agent OTP, including all necessary steps for launching the cloud service, SDK packages, and documentation site.

---

## Table of Contents

1. [Release Overview](#release-overview)
2. [Pre-Release Checklist](#pre-release-checklist)
3. [SDK Package Release](#sdk-package-release)
4. [Cloud Service Deployment](#cloud-service-deployment)
5. [Documentation Site](#documentation-site)
6. [Landing Page](#landing-page)
7. [Marketing & Launch](#marketing--launch)
8. [Post-Launch Tasks](#post-launch-tasks)

---

## Release Overview

### Release Timeline

```
Week 1: Pre-release preparation
  ├── Finalize code and tests
  ├── Security audit
  └── Documentation review

Week 2: Soft launch
  ├── Deploy to production
  ├── Publish SDK packages
  └── Launch documentation

Week 3: Public launch
  ├── Launch landing page
  ├── Social media announcements
  └── Community outreach

Week 4+: Iteration
  ├── Monitor metrics
  ├── Address feedback
  └── Plan next features
```

### Version Strategy

- **Initial Release**: v0.1.0 (Beta)
- **Stable Release**: v1.0.0 (after beta feedback)
- **Versioning**: Semantic Versioning (semver)

---

## Pre-Release Checklist

### Code Quality

- [ ] All tests passing (`bun test`)
- [ ] Test coverage > 80% for core logic
- [ ] No ESLint warnings
- [ ] TypeScript strict mode enabled
- [ ] Security audit completed (npm audit)
- [ ] Dependencies updated
- [ ] License files in place

### Documentation

- [ ] API reference complete
- [ ] SDK documentation complete
- [ ] Integration guides written
- [ ] Architecture diagrams created
- [ ] CHANGELOG.md updated
- [ ] README.md finalized

### Infrastructure

- [ ] Production environment configured
- [ ] Secrets management set up
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] Error tracking enabled

---

## SDK Package Release

### Package: `@orrisai/agent-otp-sdk`

#### 1. Prepare for Release

```bash
# Navigate to SDK package
cd packages/sdk

# Update version in package.json
npm version patch  # or minor/major

# Run final checks
bun test
bun run typecheck
bun run build
```

#### 2. Update CHANGELOG

```markdown
# Changelog

## [0.1.0] - 2026-01-28

### Added
- Initial release
- `AgentOTPClient` class for permission management
- `requestPermission()` with auto-wait support
- `verifyToken()` and `useToken()` methods
- `executeWithPermission()` helper
- Comprehensive error types
- TypeScript type definitions
```

#### 3. Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish with public access
npm publish --access public

# Or using Bun
bun publish --access public
```

#### 4. Create GitHub Release

```bash
# Tag the release
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0

# Create release on GitHub with:
# - Release notes from CHANGELOG
# - Link to npm package
# - Link to documentation
```

#### 5. Verify Publication

```bash
# Verify package is available
npm info @orrisai/agent-otp-sdk

# Test installation in new project
mkdir test-install && cd test-install
npm init -y
npm install @orrisai/agent-otp-sdk
```

### Package: `@orrisai/agent-otp-shared`

Follow the same process for the shared package:

```bash
cd packages/shared
npm version patch
bun run build
npm publish --access public
```

---

## Cloud Service Deployment

### API Service (Cloudflare Workers)

#### 1. Set Up Cloudflare Account

1. Create Cloudflare account at cloudflare.com
2. Add domain `agentotp.com`
3. Enable Workers

#### 2. Configure Secrets

```bash
cd apps/api

# Set production secrets
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put UPSTASH_REDIS_REST_URL
wrangler secret put UPSTASH_REDIS_REST_TOKEN
wrangler secret put JWT_SECRET
wrangler secret put TELEGRAM_BOT_TOKEN
```

#### 3. Deploy to Production

```bash
# Deploy to production
wrangler deploy --env production

# Verify deployment
curl https://api.agentotp.com/health
```

#### 4. Configure Custom Domain

```bash
# Add custom domain route in wrangler.toml
# Or via Cloudflare dashboard:
# Workers > agent-otp-api > Triggers > Custom Domains
# Add: api.agentotp.com
```

### Dashboard (Vercel)

#### 1. Connect Repository

1. Go to vercel.com/new
2. Import `agent-otp` repository
3. Select `apps/dashboard` as root directory
4. Configure environment variables

#### 2. Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.agentotp.com
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 3. Configure Domain

1. Go to Project Settings > Domains
2. Add `app.agentotp.com`
3. Configure DNS records in Cloudflare

### Database (Supabase)

#### 1. Create Production Project

1. Create new project at supabase.com
2. Note the project URL and keys
3. Run migrations

```bash
# Apply migrations
supabase db push --project-ref your-project-ref
```

#### 2. Enable Row Level Security

Enable RLS policies as defined in migrations.

#### 3. Configure Auth

Set up authentication providers in Supabase dashboard.

---

## Documentation Site

### Structure

```
docs.agentotp.com/
├── /                     # Introduction
├── /getting-started/     # Quick start guides
│   ├── installation
│   ├── first-permission
│   └── configuration
├── /guides/              # In-depth tutorials
│   ├── policies
│   ├── telegram-integration
│   └── custom-approvals
├── /api-reference/       # API documentation
│   ├── permissions
│   ├── policies
│   ├── agents
│   └── audit
├── /sdk/                 # SDK documentation
│   ├── typescript
│   ├── python
│   └── go
├── /examples/            # Code examples
├── /architecture/        # Design documents
├── /changelog/           # Version history
├── /contributing/        # Contribution guide
└── /legal/               # Terms, Privacy, License
```

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS + shadcn/ui
- **Content**: MDX with next-mdx-remote
- **Search**: Algolia DocSearch
- **Hosting**: Vercel

### Key Pages

1. **Introduction** - What is Agent OTP, why use it
2. **Quick Start** - 5-minute getting started guide
3. **Installation** - All installation methods
4. **API Reference** - Complete API documentation
5. **SDK Reference** - SDK methods and types
6. **Architecture** - System design diagrams
7. **Examples** - Real-world integrations
8. **FAQ** - Common questions
9. **Changelog** - Version history
10. **Contributing** - How to contribute

---

## Landing Page

### URL: `agentotp.com`

### Sections

1. **Hero**
   - Headline: "One-Time Permissions for AI Agents"
   - Subheadline: "Give your AI agents scoped, ephemeral access with human-in-the-loop approval"
   - CTA: "Get Started Free" + "View Documentation"

2. **Problem/Solution**
   - Problem: AI agents need access to sensitive operations
   - Solution: Scoped, time-limited, approved permissions

3. **How It Works**
   - Visual diagram of the flow
   - 3 steps: Request → Approve → Execute

4. **Features**
   - Scoped permissions
   - Ephemeral tokens (auto-expire)
   - Policy-based decisions
   - Human-in-the-loop approval
   - Full audit trail
   - Multi-platform (Telegram, Web)

5. **Use Cases**
   - Email sending
   - File operations
   - Financial transactions
   - API access control

6. **Integrations**
   - Moltbot
   - LangChain
   - CrewAI
   - AutoGen

7. **Pricing**
   - Free, Pro, Team, Enterprise tiers

8. **Testimonials** (post-launch)

9. **FAQ**

10. **CTA Section**
    - "Start Building with Agent OTP"
    - Sign up form

### SEO Requirements

- Meta title: "Agent OTP - One-Time Permissions for AI Agents"
- Meta description: "Secure your AI agents with scoped, ephemeral, human-approved permissions. Open source SDK with cloud service."
- Open Graph images
- Structured data (Organization, Product, FAQ)
- Sitemap.xml
- robots.txt
- Performance: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## Marketing & Launch

### Pre-Launch (1 week before)

- [ ] Set up Twitter/X account (@AgentOTP)
- [ ] Create Product Hunt draft
- [ ] Write blog post announcement
- [ ] Prepare demo video
- [ ] Reach out to beta testers

### Launch Day

1. **Product Hunt**
   - Submit with compelling tagline
   - Prepare for Q&A

2. **Hacker News**
   - "Show HN: Agent OTP - One-Time Permissions for AI Agents"
   - Highlight open source aspect

3. **Reddit**
   - r/MachineLearning
   - r/artificial
   - r/LocalLLaMA
   - r/programming

4. **Twitter/X**
   - Launch thread
   - Demo GIF
   - Tag relevant accounts

5. **Discord/Slack**
   - AI/ML communities
   - Developer communities

### Content Calendar

| Week | Content |
|------|---------|
| Launch | Announcement blog post |
| +1 | "How to secure your LangChain agent" tutorial |
| +2 | "Policy patterns for AI agents" guide |
| +3 | Case study with real user |
| +4 | Integration with popular framework |

---

## Post-Launch Tasks

### Week 1

- [ ] Monitor error rates and performance
- [ ] Respond to GitHub issues
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Update documentation based on questions

### Week 2-4

- [ ] Implement top feature requests
- [ ] Improve onboarding based on feedback
- [ ] Create additional tutorials
- [ ] Reach out for testimonials
- [ ] Plan v0.2.0 release

### Ongoing

- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly roadmap reviews
- [ ] Community engagement

---

## Support Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Q&A, ideas
- **Discord**: Community chat (future)
- **Email**: support@agentotp.com

---

## Metrics to Track

### Product

- Sign-ups (daily, weekly, monthly)
- API requests (by endpoint)
- Permission approvals/denials
- Active agents
- Token usage

### Technical

- API latency (p50, p95, p99)
- Error rate
- Uptime (target: 99.9%)
- Database size/growth

### Business

- Free → Pro conversion rate
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Churn rate

---

## Emergency Procedures

### Service Outage

1. Check Cloudflare status
2. Check Supabase status
3. Review recent deployments
4. Roll back if necessary
5. Communicate status to users

### Security Incident

1. Assess scope and severity
2. Contain the issue
3. Notify affected users
4. Document timeline
5. Implement fixes
6. Publish post-mortem

---

## Contact

- **Technical Lead**: [Your Name]
- **Email**: team@agentotp.com
- **Repository**: github.com/agent-otp/agent-otp
