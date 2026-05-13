# auth.interceptor.ts

HTTP interceptor that handles JWT authentication for all outgoing API requests. It attaches the access token as a Bearer header and implements automatic token refresh on 401 responses.

## Key Exports / Components

- `authInterceptor` — `HttpInterceptorFn` (functional interceptor) that:
  - Attaches `Authorization: Bearer <token>` to non-auth requests
  - Catches 401 errors and attempts a silent token refresh
  - Retries the original request with the new token on successful refresh
  - Redirects to `/login` if refresh fails

## Dependencies

- `@angular/common/http` — HttpInterceptorFn, HttpRequest, HttpErrorResponse
- `@angular/core` — inject
- `@angular/router` — Router (for login redirect)
- `rxjs` — from, switchMap, throwError, catchError
- `AuthService` — Provides access token and refresh logic

## How It Works

1. Checks if the request targets an auth endpoint (`/auth/login` or `/auth/refresh`) — if so, passes through without modification to prevent infinite loops.
2. Clones the request with the current access token attached as a Bearer header.
3. If the response returns a 401 status, calls `authService.refreshAccessToken()` to obtain a new token.
4. On successful refresh, retries the original request with the new token.
5. If refresh fails (returns null), navigates to `/login` and propagates the error.
