# auth.service.ts

Core authentication service that handles token generation, identity provider verification (Google and Microsoft), password-based login, token refresh with rotation, and logout. Manages JWT access and refresh token pairs with hashed refresh token storage for security.

## Key Exports

- `AuthService` — Injectable service with methods for all login flows, token refresh, and logout
- `TokenPair` — Interface with `accessToken` and `user` fields

## Dependencies

- `@nestjs/jwt` — JwtService for signing and verifying tokens
- `@nestjs/config` — ConfigService for secrets and client IDs
- `../user/user.service` — UserService for user upsert and refresh token storage
- `google-auth-library` — Google OAuth2Client for ID token verification (dynamic import)
- `jwks-rsa` — Microsoft JWKS key resolution
- `jsonwebtoken` — Low-level JWT verification for Microsoft tokens
- `node:crypto` — SHA-256 hashing of refresh tokens

## How It Works

1. **Google login**: Verifies the Google ID token using `OAuth2Client`, extracts email/name/photo, upserts the user, generates an access token (short-lived) and refresh token (7d), stores the refresh token hash
2. **Microsoft login**: Verifies the Microsoft ID token against Microsoft's JWKS endpoint using RS256, extracts email from `preferred_username` or `email` claim, then follows the same upsert + token generation flow
3. **Password login**: Validates credentials via `UserService.validatePassword()`, checks account status (pending/revoked), then issues tokens
4. **Dev login**: Bypasses verification entirely (MOCK_MODE only), issues tokens for a synthetic user
5. **Token refresh**: Verifies the refresh token signature, compares its hash against the stored hash (detects reuse attacks), rotates both tokens
6. **Logout**: Nullifies the stored refresh token hash, effectively revoking all refresh tokens for that user
