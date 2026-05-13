# jwt-auth.guard.ts

Global authentication guard that protects all routes by default using JWT validation. Supports opting out via the `@Public()` decorator and includes special handling for `MOCK_MODE` where a synthetic user is injected if no valid token is present.

## Key Exports

- `JwtAuthGuard` — Injectable guard extending Passport's `AuthGuard('jwt')`

## Dependencies

- `@nestjs/common` — ExecutionContext, Injectable
- `@nestjs/core` — Reflector for reading metadata
- `@nestjs/passport` — AuthGuard base class
- `./public.decorator` — IS_PUBLIC_KEY metadata key
- `./jwt.strategy` — JwtPayload type
- `rxjs` — Observable handling for Passport's canActivate return types

## How It Works

1. Checks if the route/controller is decorated with `@Public()` via Reflector — if so, allows access immediately
2. In `MOCK_MODE`, attempts JWT validation first; if it fails (or no token is present), attaches a default mock user (`mock@cloud42.dev`, role `admin`) to the request and allows access
3. In normal mode, delegates to Passport's standard JWT authentication flow — invalid or missing tokens result in a 401 Unauthorized response
