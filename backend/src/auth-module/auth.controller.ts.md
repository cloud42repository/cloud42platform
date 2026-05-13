# auth.controller.ts

REST controller handling all authentication endpoints under `/api/auth`. Supports Google login, Microsoft login, password login, a dev/mock login, token refresh via HttpOnly cookies, user profile retrieval, and logout.

## Key Exports

- `AuthController` — NestJS controller with routes for login, refresh, me, and logout

## Dependencies

- `@nestjs/common` — Controller, decorators, HTTP status helpers
- `express` — Request/Response types
- `./auth.service` — AuthService for business logic
- `./public.decorator` — `@Public()` to mark routes as unauthenticated
- `./jwt.strategy` — JwtPayload type

## How It Works

1. **POST /api/auth/login** — Accepts a Google `idToken`, verifies it via `AuthService.loginWithGoogle()`, sets an HttpOnly refresh cookie, and returns access + refresh tokens with user info
2. **POST /api/auth/microsoft-login** — Same flow for Microsoft ID tokens
3. **POST /api/auth/dev-login** — Only available when `MOCK_MODE=true`; issues tokens without identity verification
4. **POST /api/auth/password-login** — Authenticates with email + password credentials
5. **POST /api/auth/refresh** — Reads refresh token from cookie or body, rotates tokens via `AuthService.refreshTokens()`
6. **GET /api/auth/me** — Returns the current user's profile from DB (requires valid JWT)
7. **POST /api/auth/logout** — Revokes the refresh token and clears the cookie

The refresh cookie is configured as `httpOnly`, `secure` in production, with `sameSite: 'none'` for cross-origin deployments and scoped to `/api/auth`.
