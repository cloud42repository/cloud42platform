# ZohoBaseClient.ts

Abstract base class for all Zoho product-specific API clients. Provides a pre-configured Axios instance with automatic OAuth token injection, 401 retry logic, and support for mock mode.

## Key Exports

- **`ZohoBaseClient`** — Abstract class that product clients (CRM, Books, etc.) extend; handles auth, interceptors, and HTTP helpers.
- **`ZohoApiError`** — Custom error class thrown when Zoho returns a response with a non-zero error `code`.

## Dependencies

- `axios` — HTTP client and types (`AxiosInstance`, `AxiosRequestConfig`, etc.).
- `./types` — `ZohoProductConfig`.
- `../auth/IAuthProvider` — `IAuthProvider` interface.
- `../auth/OAuthRefreshProvider` — Default fallback auth provider.
- `../mock/mock-auth-provider` — `MockAuthProvider` for mock mode.
- `../mock/mock-adapter` — `attachMockAdapter` for intercepting HTTP in mock mode.

## How It Works

1. **Constructor** — Selects the auth provider: `MockAuthProvider` if `MOCK_MODE=true`, an explicit `authProvider` from config, or falls back to `OAuthRefreshProvider` with a refresh token. Creates an Axios instance with the product's `apiBaseUrl` and attaches interceptors.
2. **Request interceptor** — Calls `auth.getAccessToken()` and sets the `Authorization: Zoho-oauthtoken <token>` header on every outgoing request.
3. **Response interceptor** — Checks for Zoho's business-level errors (HTTP 200 but `code !== 0`) and throws `ZohoApiError`. On 401, invalidates the provider and retries once with a fresh token.
4. **HTTP helpers** — `get()`, `post()`, `put()`, `patch()`, `delete()` — thin wrappers that return `response.data` directly.
5. **Mock mode** — When `MOCK_MODE=true`, attaches `axios-mock-adapter` to intercept all requests with simulated responses.
