# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-01-29

### Added

- **Core API Service**
  - Permission request/verify/use endpoints
  - Policy-based decision engine with conditions (equals, startsWith, matches, lessThan, etc.)
  - Token generation with scoped, ephemeral access
  - Full audit logging

- **TypeScript SDK (`@orrisai/agent-otp-sdk`)**
  - `AgentOTPClient` class for permission management
  - `requestPermission()` with auto-wait support
  - `verifyToken()` and `useToken()` methods
  - `executeWithPermission()` helper for common patterns
  - Comprehensive error types (`PermissionDeniedError`, `TokenExpiredError`, etc.)
  - Full TypeScript type definitions

- **Shared Package (`@orrisai/agent-otp-shared`)**
  - Common types and interfaces
  - Zod validation schemas
  - Shared constants (permission status, policy actions, etc.)

- **Website**
  - Landing page with features, pricing, and documentation
  - Documentation site with quickstart guide
  - SDK reference documentation
  - Use cases and examples

- **Infrastructure**
  - Monorepo setup with Bun workspaces
  - Hono API framework for edge deployment
  - Supabase integration for database
  - Redis/Upstash for token caching

### Security

- One-time use tokens by default
- Short TTL (default 5 minutes, max 1 hour)
- Token hashing with SHA-256
- Rate limiting support
- Full audit trail

## [Unreleased]

### Planned

- Telegram bot for approval notifications
- Web dashboard for policy management
- Python SDK
- Go SDK
- Webhook notifications
