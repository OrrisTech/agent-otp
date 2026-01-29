# SDK Publishing Guide

This guide provides detailed instructions for publishing the Agent OTP SDK packages to npm and other package registries.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Package Configuration](#package-configuration)
3. [Publishing to npm](#publishing-to-npm)
4. [Automated Publishing (CI/CD)](#automated-publishing-cicd)
5. [Version Management](#version-management)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **npm Account**
   - Create at: https://www.npmjs.com/signup
   - Enable 2FA for security
   - Create access token for CI/CD

2. **GitHub Account**
   - For source code hosting
   - For GitHub Actions CI/CD

### Required Tools

```bash
# Node.js 20+
node --version  # Should be >= 20.0.0

# Bun (package manager)
bun --version  # Should be >= 1.1.0

# npm CLI (for publishing)
npm --version  # Should be >= 10.0.0
```

### npm Login

```bash
# Login to npm (interactive)
npm login

# Verify login
npm whoami
```

---

## Package Configuration

### package.json Setup

Ensure your `packages/sdk/package.json` is properly configured:

```json
{
  "name": "@orrisai/agent-otp-sdk",
  "version": "0.1.0",
  "description": "TypeScript SDK for Agent OTP - One-Time Permissions for AI Agents",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "keywords": [
    "agent",
    "otp",
    "permission",
    "ai",
    "security",
    "authentication",
    "one-time-permission",
    "langchain",
    "llm"
  ],
  "author": "Agent OTP Team <team@agentotp.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/agent-otp/agent-otp.git",
    "directory": "packages/sdk"
  },
  "bugs": {
    "url": "https://github.com/agent-otp/agent-otp/issues"
  },
  "homepage": "https://agentotp.com",
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### Required Files

Ensure these files exist in `packages/sdk/`:

1. **README.md** - Package documentation
2. **LICENSE** - MIT license file
3. **CHANGELOG.md** - Version history

---

## Publishing to npm

### Manual Publishing

#### Step 1: Pre-publish Checks

```bash
cd packages/sdk

# Clean previous builds
rm -rf dist

# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Build
bun run build

# Verify build output
ls -la dist/
```

#### Step 2: Version Bump

```bash
# For patch release (0.1.0 -> 0.1.1)
npm version patch

# For minor release (0.1.0 -> 0.2.0)
npm version minor

# For major release (0.1.0 -> 1.0.0)
npm version major

# For prerelease (0.1.0 -> 0.1.1-beta.0)
npm version prerelease --preid=beta
```

#### Step 3: Publish

```bash
# Dry run first (simulates publish)
npm publish --dry-run

# Publish to npm
npm publish --access public

# Or with Bun
bun publish --access public
```

#### Step 4: Verify Publication

```bash
# Check package info
npm info @orrisai/agent-otp-sdk

# View on npm website
open https://www.npmjs.com/package/@orrisai/agent-otp-sdk
```

#### Step 5: Create Git Tag

```bash
# Get current version
VERSION=$(node -p "require('./package.json').version")

# Create and push tag
git tag -a "v$VERSION" -m "Release v$VERSION"
git push origin "v$VERSION"
```

### Publishing Shared Package

```bash
cd packages/shared

# Same process
bun run build
npm version patch
npm publish --access public
```

---

## Automated Publishing (CI/CD)

### GitHub Actions Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # For npm provenance

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Build packages
        run: |
          cd packages/shared && bun run build
          cd ../sdk && bun run build

      - name: Run tests
        run: bun test

      - name: Setup Node.js for npm
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Publish @orrisai/agent-otp-shared
        run: |
          cd packages/shared
          npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish @orrisai/agent-otp-sdk
        run: |
          cd packages/sdk
          npm publish --access public --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Setting Up npm Token

1. Generate token on npm:
   ```
   npm token create --read-only=false --cidr-whitelist=""
   ```

2. Add to GitHub Secrets:
   - Go to: Repository > Settings > Secrets > Actions
   - Add: `NPM_TOKEN` with your token value

### Automated Version Bumping

Create `.github/workflows/version-bump.yml`:

```yaml
name: Version Bump

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version type (patch, minor, major)'
        required: true
        default: 'patch'
        type: choice
        options:
          - patch
          - minor
          - major
      package:
        description: 'Package to bump'
        required: true
        type: choice
        options:
          - sdk
          - shared
          - all

jobs:
  bump:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1

      - name: Bump version
        run: |
          if [ "${{ inputs.package }}" = "all" ] || [ "${{ inputs.package }}" = "shared" ]; then
            cd packages/shared
            npm version ${{ inputs.version }} --no-git-tag-version
            cd ../..
          fi
          if [ "${{ inputs.package }}" = "all" ] || [ "${{ inputs.package }}" = "sdk" ]; then
            cd packages/sdk
            npm version ${{ inputs.version }} --no-git-tag-version
          fi

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "chore: bump version to ${{ inputs.version }}"
          git push
```

---

## Version Management

### Semantic Versioning

Follow [semver](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features (backwards compatible)
- **PATCH** (0.0.1): Bug fixes (backwards compatible)

### Pre-release Versions

```bash
# Alpha (early testing)
npm version 1.0.0-alpha.0
npm version prerelease --preid=alpha

# Beta (feature complete)
npm version 1.0.0-beta.0
npm version prerelease --preid=beta

# Release candidate
npm version 1.0.0-rc.0
npm version prerelease --preid=rc
```

### CHANGELOG Format

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New feature description

### Changed
- Updated behavior description

### Deprecated
- Soon-to-be removed feature

### Removed
- Removed feature

### Fixed
- Bug fix description

### Security
- Security fix description

## [0.1.0] - 2026-01-28

### Added
- Initial release
- `AgentOTPClient` class
- Permission request/verify/use methods
- TypeScript type definitions
```

---

## Troubleshooting

### Common Issues

#### 1. "Package name already exists"

```bash
# Check if package name is available
npm search @orrisai/agent-otp-sdk

# If taken, use a different scope or name
```

#### 2. "You must be logged in"

```bash
# Login again
npm login

# Verify
npm whoami
```

#### 3. "402 Payment Required"

This means you're trying to publish a scoped package privately:

```bash
# Publish with public access
npm publish --access public
```

#### 4. "Version already exists"

```bash
# Check published versions
npm view @orrisai/agent-otp-sdk versions

# Bump to new version
npm version patch
```

#### 5. "Missing files in package"

```bash
# Check what will be published
npm pack --dry-run

# Ensure files are listed in package.json "files" array
```

### Debugging

```bash
# Verbose publish output
npm publish --access public --verbose

# Check npm registry status
npm ping

# Clear npm cache
npm cache clean --force
```

### Unpublishing (Emergency Only)

npm allows unpublishing within 72 hours:

```bash
# Unpublish specific version
npm unpublish @orrisai/agent-otp-sdk@0.1.0

# Unpublish entire package (within 72 hours)
npm unpublish @orrisai/agent-otp-sdk --force
```

**Warning**: Unpublishing can break dependent projects. Use deprecation instead:

```bash
# Deprecate a version
npm deprecate @orrisai/agent-otp-sdk@0.1.0 "Use version 0.2.0 instead"
```

---

## Best Practices

### Before Publishing

1. **Test in isolation**: Install from local tarball
   ```bash
   npm pack
   cd /tmp
   npm init -y
   npm install /path/to/agent-otp-sdk-0.1.0.tgz
   ```

2. **Check bundle size**: Use [bundlephobia](https://bundlephobia.com/)

3. **Verify types**: Test TypeScript definitions work

4. **Update documentation**: Ensure README matches current API

### Security

1. Enable 2FA on npm account
2. Use automation tokens (not publish tokens)
3. Enable npm provenance for transparency
4. Review dependencies regularly

### Communication

1. Announce releases on social media
2. Update CHANGELOG for every release
3. Create GitHub releases with notes
4. Notify users of breaking changes in advance

---

## Quick Reference

### Release Checklist

```bash
# 1. Ensure clean working directory
git status

# 2. Pull latest changes
git pull origin main

# 3. Run full test suite
bun test

# 4. Build packages
bun run build

# 5. Bump version
npm version patch

# 6. Publish
npm publish --access public

# 7. Push changes and tag
git push && git push --tags

# 8. Create GitHub release
gh release create v$(node -p "require('./package.json').version")
```

### Useful Commands

```bash
# View package info
npm info @orrisai/agent-otp-sdk

# List published versions
npm view @orrisai/agent-otp-sdk versions

# Check download stats
npm view @orrisai/agent-otp-sdk

# Simulate publish
npm publish --dry-run

# Pack without publishing
npm pack
```
