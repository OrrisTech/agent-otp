# Changelog

## [0.1.0] - 2026-01-29

### Added

- Initial release
- `AgentOTPClient` class for permission management
- `requestPermission()` with configurable options
- `verifyToken()` for token validation
- `useToken()` for consuming permissions
- `executeWithPermission()` helper for common patterns
- `waitForPermission()` for async approval flows
- Comprehensive error types:
  - `AgentOTPError` (base)
  - `PermissionDeniedError`
  - `PermissionExpiredError`
  - `TokenExpiredError`
  - `TokenConsumedError`
  - `InvalidTokenError`
  - `NetworkError`
  - `RateLimitError`
- Full TypeScript type definitions
