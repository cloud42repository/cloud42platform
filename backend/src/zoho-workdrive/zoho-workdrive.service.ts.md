# zoho-workdrive.service.ts

Injectable NestJS service providing per-user Zoho WorkDrive API access with automatic client caching and a default shared client fallback.

## Key Exports

- **ZohoWorkdriveService** — Service managing `ZohoWorkDriveClient` instances per user (cached 10 minutes) with default fallback.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService for environment variables
- `AuthConfigService` — Per-user Zoho credential retrieval
- `ZohoOAuthService` — OAuth lifecycle management
- `StoredTokenAuthProvider` — Token provider using persisted OAuth tokens
- `getCurrentUserEmail` — Request context user extraction
- `ZohoWorkDriveClient` — Low-level WorkDrive API client

## How It Works

1. Constructs a `defaultClient` from environment variables on initialization.
2. `getClient()` resolves per-user credentials from auth-config and creates/caches dedicated clients.
3. Exposes methods for teams, folders, files, share links, and workspace members — all delegating to the resolved client.
4. OAuth methods handle token exchange/revocation and invalidate cached clients on credential changes.
