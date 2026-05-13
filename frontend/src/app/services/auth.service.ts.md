# auth.service.ts

Manages user authentication state including login (Google, Microsoft, password, dev-mock), JWT token persistence, silent token refresh, profile syncing, and logout. Exposes reactive signals for the current user and login state.

## Key Exports

- **`CloudUser`** — Interface representing the logged-in user (name, email, firstName, photoUrl, role).
- **`AuthService`** — Injectable service handling all auth flows and token lifecycle.

## Dependencies

- `@angular/core` — `Injectable`, `signal`, `computed`
- `@angular/common/http` — `HttpClient`
- `@angular/router` — `Router`
- `rxjs` — `firstValueFrom`
- `../config/user.types` — `UserRole`
- `../../environments/environment` — `environment.apiBase`

## How It Works

1. **Token storage** — Access token is kept in `sessionStorage` (survives page refresh within tab); refresh token is stored alongside it. Non-sensitive profile data is in `localStorage`.
2. **Login methods** — `loginWithGoogle`, `loginWithMicrosoft`, `loginWithPassword`, and `devLogin` all POST credentials to the backend, receive JWT access/refresh tokens, persist them, and update the reactive `_user` signal.
3. **Token refresh** — `refreshAccessToken()` deduplicates concurrent refresh attempts. It sends the stored refresh token to `/auth/refresh` and updates local state on success; on failure it clears session.
4. **Profile sync** — `syncProfile()` fetches `/auth/me` to update the user's role if it changed server-side.
5. **Logout** — Calls backend `/auth/logout`, clears all tokens and stored profile, and navigates to `/login`.
