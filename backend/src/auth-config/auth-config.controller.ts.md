# auth-config.controller.ts

REST controller for managing per-user, per-module authentication configurations. Supports Zoho OAuth code exchange and admin access to other users' configs.

## Key Exports

- **AuthConfigController** — NestJS controller registered at `/auth-configs` with endpoints for listing, getting, saving, and deleting auth configs.

## Dependencies

- `@nestjs/common` — decorators (`Controller`, `Get`, `Put`, `Delete`, `Param`, `Body`, `Req`, `HttpCode`, `HttpStatus`, `Logger`)
- `AuthConfigService` — persistence logic for auth configs
- `ZohoOAuthService` — handles Zoho authorization code exchange
- `SaveAuthConfigDto` — request DTO
- `JwtPayload` — JWT user type from auth module
- `Roles` — role-based access decorator

## How It Works

1. **GET /auth-configs** — returns all auth configs for the authenticated user (extracted from JWT).
2. **GET /auth-configs/:moduleId** — returns a specific module's auth config for the current user.
3. **PUT /auth-configs/:moduleId** — upserts an auth config. Special handling for `__zoho__` module: if a `code` field is present, it exchanges the authorization code for tokens via `ZohoOAuthService.exchangeAndStore()`.
4. **DELETE /auth-configs/:moduleId** — removes the auth config for the current user and module.
5. **GET /auth-configs/admin/:userEmail** — admin-only route that lists all configs for any user (protected by `@Roles('admin')`).
