# ZohoBaseClient.spec.ts

Tests the abstract `ZohoBaseClient` base class (via a concrete `TestClient` subclass), covering constructor validation, authorization header injection, error handling with `ZohoApiError`, automatic 401 retry with token refresh, HTTP method wrappers (GET/POST/PUT/PATCH/DELETE), default query parameters, and getter accessors.

## Test Suites

- **ZohoBaseClient** — Single top-level suite covering all base client behaviors.

## Key Test Cases

- `throws when neither authProvider nor refreshToken is supplied` — Constructor validation.
- `does not throw when refreshToken is supplied` — Validates alternative auth config.
- `injects Zoho-oauthtoken Authorization header on each request` — Confirms auth header format.
- `rejects with ZohoApiError when response body code !== 0` — Tests Zoho-specific error detection.
- `does NOT reject when response body has no code field` — Passthrough for non-Zoho responses.
- `retries once after 401 and succeeds with the refreshed token` — Tests automatic 401 retry with token rotation.
- `does NOT retry more than once on 401` — Confirms retry limit of one.
- `get/post/put/patch/delete() returns response data` — HTTP method wrapper correctness.
- `appends defaultParams to every request` — Query parameter injection.
- `authProvider getter exposes the IAuthProvider instance` — Accessor verification.

## Test Setup

- Uses `axios-mock-adapter` to intercept HTTP requests on the client's axios instance.
- `PassthroughAuth` and `CustomAuthProvider` are used as auth providers.
- `beforeEach` creates a fresh client and mock adapter; `afterEach` restores the mock.
- A `makeClient()` helper constructs the test client with configurable options.
