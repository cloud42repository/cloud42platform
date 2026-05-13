# auth.guard.ts

Route guard that protects authenticated routes. Checks if the user has a valid session and access token before allowing navigation; otherwise redirects to the login page.

## Key Exports / Components

- `authGuard` — `CanActivateFn` (functional route guard) that:
  - Allows all navigation in mock mode
  - Passes if the user is logged in with a valid access token
  - Attempts a token refresh if logged in but token is missing
  - Redirects to `/login` with `returnUrl` query param on failure

## Dependencies

- `@angular/core` — inject
- `@angular/router` — CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot
- `AuthService` — Authentication state and token refresh
- `environment` — Environment config (for `mockMode` check)

## How It Works

1. If `environment.mockMode` is true, immediately returns `true` (bypasses auth).
2. If the user is logged in and has an access token, allows navigation.
3. If the user is logged in but has no token, attempts an async refresh — if successful, allows navigation.
4. Otherwise, creates a URL tree redirecting to `/login` with the original URL preserved as `returnUrl` so the user can be redirected back after login.
