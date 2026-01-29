# Contributing to Agent OTP

Thank you for your interest in contributing to Agent OTP! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.1.0
- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 18+ (for compatibility testing)

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/agent-otp.git
   cd agent-otp
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/yourusername/agent-otp.git
   ```

4. Install dependencies:
   ```bash
   bun install
   ```

5. Start local services:
   ```bash
   docker compose up -d
   ```

6. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

7. Run the development server:
   ```bash
   bun dev
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/telegram-notifications`)
- `fix/` - Bug fixes (e.g., `fix/token-expiration`)
- `docs/` - Documentation changes (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/policy-engine`)
- `test/` - Test additions or fixes (e.g., `test/sdk-coverage`)

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature
   ```

2. Make your changes following the coding standards

3. Write or update tests as needed

4. Run the test suite:
   ```bash
   bun test
   ```

5. Run the linter:
   ```bash
   bun lint
   ```

6. Commit your changes with a descriptive message:
   ```bash
   git commit -m "feat: add telegram notification support"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add webhook notification channel
fix: correct token expiration calculation
docs: update SDK installation instructions
test: add policy engine unit tests
```

### Pull Request Process

1. Update your branch with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Push your branch:
   ```bash
   git push origin feature/your-feature
   ```

3. Open a Pull Request on GitHub

4. Fill out the PR template with:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

5. Wait for review and address any feedback

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use interfaces for object shapes
- Export types from dedicated `types.ts` files

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Maximum line length: 100 characters

### Documentation

- Add JSDoc comments for public APIs
- Keep comments concise and meaningful
- Update README when adding features

### Testing

- Write unit tests for new functionality
- Maintain test coverage above 80%
- Use descriptive test names
- Group related tests with `describe()`

Example test structure:
```typescript
describe('PolicyEngine', () => {
  describe('evaluate', () => {
    it('should auto-approve when conditions match', async () => {
      // Test implementation
    });

    it('should require approval for unmatched conditions', async () => {
      // Test implementation
    });
  });
});
```

## Project Structure

```
agent-otp/
├── apps/
│   ├── api/              # Hono API service
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── services/ # Business logic
│   │   │   └── middleware/
│   │   └── tests/
│   ├── website/          # Next.js documentation site
│   └── telegram-bot/     # Telegram bot service
├── packages/
│   ├── sdk/              # TypeScript SDK
│   │   ├── src/
│   │   └── tests/
│   └── shared/           # Shared types and utilities
└── docs/                 # Internal documentation
```

## Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue` - these are suitable for newcomers.

### Feature Requests

Check issues labeled `enhancement` for feature ideas.

### Documentation

Documentation improvements are always welcome:
- Fix typos
- Clarify instructions
- Add examples
- Translate documentation

### Testing

Help improve test coverage:
- Add unit tests for uncovered code
- Add integration tests
- Add end-to-end tests

## Getting Help

- Open a GitHub issue for bugs or feature requests
- Join our [Discord community](https://discord.gg/agentotp) for discussions
- Email support@agentotp.com for private inquiries

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Our documentation site

Thank you for contributing to Agent OTP!
