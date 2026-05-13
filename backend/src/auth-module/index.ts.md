# index.ts

Barrel file that re-exports the public API of the `auth-module` package. Provides a single import path for consumers needing auth-related classes, guards, decorators, or types.

## Key Exports

- `AuthModule` — The auth NestJS module
- `AuthService` — Service for login, refresh, and logout operations
- `JwtAuthGuard` — Global JWT authentication guard
- `RolesGuard` — Role-based authorization guard
- `Public` — Decorator to mark routes as publicly accessible
- `Roles` — Decorator to restrict routes by user role
- `JwtPayload` — Type representing the decoded JWT token payload

## Dependencies

- `./auth.module`
- `./auth.service`
- `./jwt-auth.guard`
- `./roles.guard`
- `./public.decorator`
- `./roles.decorator`
- `./jwt.strategy`

## How It Works

Aggregates and re-exports all public symbols from the auth module's internal files, enabling clean imports like `import { AuthService, Public, Roles } from './auth-module'` instead of importing from individual files.
