# auth.controller.e2e-spec.ts

End-to-end tests for the `AuthController`, verifying authentication endpoints including Google ID token login, developer login, token refresh, and logout functionality using the full NestJS application module.

## Test Suites

- **AuthController (e2e)** — Tests authentication controller endpoints with the real AppModule wired up.

## Key Test Cases

- `POST /auth/login → login()` — Verifies that login with an invalid Google ID token rejects appropriately.
- `POST /auth/dev-login → devLogin()` — Confirms developer login returns an access token.
- `POST /auth/refresh → refresh()` — Ensures refresh without a cookie throws "No refresh token".
- `POST /auth/logout → logout()` — Validates logout returns `{ ok: true }`.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- Mocks `res` object with `cookie` and `clearCookie` jest functions.
- Mocks `req` with user/cookies as needed per endpoint.
- Module fixture is closed in `afterAll`.
