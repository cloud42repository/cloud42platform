# StoredTokenAuthProvider.ts

An application-level auth provider that retrieves valid Zoho access tokens from the database via `ZohoOAuthService`. Used when users connect their Zoho accounts through the platform's settings UI and tokens are stored/refreshed server-side.

## Key Exports

- **`StoredTokenAuthProvider`** — Class implementing `IAuthProvider`; fetches tokens from the database-backed `ZohoOAuthService` for a specific user email.

## Dependencies

- `@nestjs/common` — `UnauthorizedException`.
- `./IAuthProvider` — `IAuthProvider` interface.
- `../zoho-oauth/zoho-oauth.service` — `ZohoOAuthService` (type import).

## How It Works

1. **Constructor** — Takes a `ZohoOAuthService` instance and a `userEmail` identifying the account.
2. **`getAccessToken()`** — Calls `zohoOAuth.getValidAccessToken(userEmail)` which handles refresh logic internally. If no token is configured for the user, throws `UnauthorizedException` prompting the user to connect their Zoho account.
3. **`invalidate()`** — Clears the local `cachedToken` reference so the next call re-queries the database service.
