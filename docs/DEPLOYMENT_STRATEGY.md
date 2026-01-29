# Agent OTP - Deployment Strategy Document

This document outlines the deployment strategy for Agent OTP, specifying which components should be deployed as services, released as SDK packages, and open-sourced.

---

## Table of Contents

1. [Overview](#overview)
2. [Component Classification](#component-classification)
3. [Deployed Services (SaaS)](#deployed-services-saas)
4. [SDK Packages (Published)](#sdk-packages-published)
5. [Open Source Components](#open-source-components)
6. [Licensing Strategy](#licensing-strategy)
7. [Infrastructure Requirements](#infrastructure-requirements)

---

## Overview

Agent OTP is a One-Time Permission (OTP) service for AI Agents. The project follows a hybrid model:

- **Cloud Service**: Hosted API and dashboard for end users
- **SDK Packages**: Published libraries for developers
- **Open Source Core**: Community-driven development with commercial offerings

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Agent OTP Ecosystem                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Cloud Service  │  │  SDK Packages   │  │   Open Source   │     │
│  │    (SaaS)       │  │   (Published)   │  │   (GitHub)      │     │
│  ├─────────────────┤  ├─────────────────┤  ├─────────────────┤     │
│  │ • API Service   │  │ • @orrisai/agent-otp-sdk│  │ • Core Library  │     │
│  │ • Web Dashboard │  │ • Python SDK    │  │ • Documentation │     │
│  │ • Telegram Bot  │  │ • Go SDK        │  │ • Examples      │     │
│  │ • Managed DB    │  │                 │  │ • CLI Tools     │     │
│  │ • Analytics     │  │                 │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Classification

### Summary Table

| Component | Type | Deployment Target | License |
|-----------|------|-------------------|---------|
| `apps/api` | Cloud Service | Cloudflare Workers | Proprietary (SaaS) |
| `apps/dashboard` | Cloud Service | Vercel | Proprietary (SaaS) |
| `apps/telegram-bot` | Cloud Service | Cloudflare Workers | Proprietary (SaaS) |
| `packages/sdk` | SDK Package | npm registry | MIT |
| `packages/shared` | Open Source | npm registry | MIT |
| Documentation | Open Source | GitHub Pages / Vercel | CC BY 4.0 |
| Examples | Open Source | GitHub | MIT |

---

## Deployed Services (SaaS)

These components are deployed and operated by the Agent OTP team. Users interact with them via the cloud service.

### 1. API Service (`apps/api`)

**Deployment Target**: Cloudflare Workers (Edge)

**Domain**: `api.agentotp.com`

**Responsibilities**:
- Permission request handling
- Token generation and verification
- Policy evaluation
- Rate limiting
- Webhook notifications

**Infrastructure**:
```yaml
Production:
  Platform: Cloudflare Workers
  Database: Supabase (PostgreSQL)
  Cache: Upstash Redis
  CDN: Cloudflare
  SSL: Automatic (Cloudflare)

Staging:
  Platform: Cloudflare Workers (staging)
  Database: Supabase (staging project)
  Cache: Upstash Redis (staging)
```

**Pricing Tiers**:
| Tier | Price | Requests/month | Agents | Features |
|------|-------|----------------|--------|----------|
| Free | $0 | 1,000 | 1 | Basic permissions |
| Pro | $29/mo | 50,000 | 5 | Custom policies, Telegram |
| Team | $99/mo | 500,000 | 20 | Team management, Analytics |
| Enterprise | Custom | Unlimited | Unlimited | SLA, Self-hosted option |

### 2. Web Dashboard (`apps/dashboard`)

**Deployment Target**: Vercel

**Domain**: `app.agentotp.com`

**Features**:
- Agent management
- Policy configuration
- Approval queue
- Audit logs viewer
- Analytics dashboard
- Team management
- Billing integration

**Tech Stack**:
- Next.js 15+
- shadcn/ui components
- TailwindCSS
- Supabase Auth

### 3. Telegram Bot (`apps/telegram-bot`)

**Deployment Target**: Cloudflare Workers

**Bot Username**: `@AgentOTPBot`

**Features**:
- Real-time approval requests
- One-tap approve/deny
- Account linking
- Status commands

---

## SDK Packages (Published)

These packages are published to public package registries for developers to integrate into their applications.

### 1. TypeScript SDK (`packages/sdk`)

**Package Name**: `@orrisai/agent-otp-sdk`

**Registry**: npm (npmjs.com)

**License**: MIT

**Installation**:
```bash
npm install @orrisai/agent-otp-sdk
# or
bun add @orrisai/agent-otp-sdk
# or
yarn add @orrisai/agent-otp-sdk
```

**Key Features**:
- Full TypeScript support
- Async/await patterns
- Built-in retry logic
- Comprehensive error handling
- Tree-shakeable exports

**Version Strategy**:
- Semantic versioning (semver)
- LTS support for major versions
- Breaking changes only in major versions

### 2. Python SDK (Future)

**Package Name**: `agent-otp`

**Registry**: PyPI

**License**: MIT

**Target**: Python 3.9+

### 3. Go SDK (Future)

**Package Name**: `github.com/agent-otp/sdk-go`

**Registry**: Go modules

**License**: MIT

---

## Open Source Components

These components are fully open source and hosted on GitHub.

### Repository Structure

```
github.com/agent-otp/agent-otp (Main Monorepo)
├── packages/
│   ├── sdk/                  # MIT - TypeScript SDK
│   └── shared/               # MIT - Shared types
├── examples/                 # MIT - Integration examples
├── docs/                     # CC BY 4.0 - Documentation
└── .github/                  # MIT - CI/CD workflows
```

### 1. Shared Types Package (`packages/shared`)

**Purpose**: Common types, schemas, and constants used across all packages.

**License**: MIT

**Why Open Source**:
- Enables community contributions
- Allows type sharing between official and community SDKs
- No competitive advantage in keeping proprietary

### 2. Documentation (`docs/`)

**License**: Creative Commons Attribution 4.0 (CC BY 4.0)

**Hosted On**:
- Primary: `docs.agentotp.com` (Vercel)
- Mirror: GitHub Pages

**Content**:
- API reference
- SDK guides
- Integration tutorials
- Architecture diagrams
- Best practices

### 3. Examples (`examples/`)

**License**: MIT

**Content**:
- Moltbot integration
- LangChain integration
- CrewAI integration
- AutoGen integration
- Custom agent examples

### 4. CLI Tools (Future)

**Package Name**: `@agent-otp/cli`

**License**: MIT

**Features**:
- Local development server
- Policy testing
- Token inspection
- Audit log export

---

## Licensing Strategy

### Dual Licensing Approach

| Component | License | Rationale |
|-----------|---------|-----------|
| SDK Packages | MIT | Maximum adoption |
| Shared Types | MIT | Community interoperability |
| Examples | MIT | Encourage learning |
| Documentation | CC BY 4.0 | Attribution for content |
| API Service | Proprietary | Revenue generation |
| Dashboard | Proprietary | Revenue generation |

### MIT License Benefits

- Permissive for commercial use
- No copyleft requirements
- Compatible with most licenses
- Industry standard for SDKs

### Open Source Governance

- **Contributions**: Via GitHub Pull Requests
- **Code Review**: Required for all PRs
- **CLA**: Contributor License Agreement required
- **Security**: Responsible disclosure policy
- **Roadmap**: Public GitHub Projects board

---

## Infrastructure Requirements

### Production Environment

```yaml
Services:
  API:
    Provider: Cloudflare Workers
    Plan: Workers Paid ($5/mo + usage)
    Regions: Global (Edge)

  Database:
    Provider: Supabase
    Plan: Pro ($25/mo)
    Region: us-east-1 (primary)
    Backup: Daily automated

  Cache:
    Provider: Upstash Redis
    Plan: Pay-as-you-go
    Region: Global (multi-region)

  Dashboard:
    Provider: Vercel
    Plan: Pro ($20/mo)
    Framework: Next.js

  Monitoring:
    APM: Sentry
    Logs: Cloudflare Logpush
    Uptime: Better Uptime

  DNS:
    Provider: Cloudflare
    Features: DNSSEC, Proxy

Domains:
  - agentotp.com (Marketing)
  - api.agentotp.com (API)
  - app.agentotp.com (Dashboard)
  - docs.agentotp.com (Documentation)
```

### Cost Estimation (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Cloudflare Workers | $5-50 | Based on requests |
| Supabase | $25 | Pro plan |
| Upstash Redis | $10-50 | Based on usage |
| Vercel | $20 | Pro plan |
| Domain | $15/yr | .com registration |
| Monitoring | $30 | Sentry + uptime |
| **Total** | **~$100-200/mo** | Starting costs |

---

## Deployment Checklist

### Pre-Launch

- [ ] Set up production Supabase project
- [ ] Configure Upstash Redis
- [ ] Deploy API to Cloudflare Workers
- [ ] Deploy Dashboard to Vercel
- [ ] Configure DNS records
- [ ] Set up SSL certificates
- [ ] Configure monitoring and alerts
- [ ] Set up error tracking (Sentry)
- [ ] Create Telegram bot
- [ ] Configure webhook endpoints

### SDK Release

- [ ] Finalize API design
- [ ] Write comprehensive tests
- [ ] Generate API documentation
- [ ] Publish to npm
- [ ] Create GitHub release
- [ ] Announce on social media

### Open Source

- [ ] Create GitHub organization
- [ ] Set up repository permissions
- [ ] Configure branch protection
- [ ] Add contributing guidelines
- [ ] Set up issue templates
- [ ] Configure CI/CD workflows
- [ ] Add code of conduct
- [ ] Create security policy

---

## Contact

- **Repository**: github.com/agent-otp/agent-otp
- **Documentation**: docs.agentotp.com
- **Support**: support@agentotp.com
- **Security**: security@agentotp.com
