# SoftvalueClient.spec.ts

Tests the `SoftvalueClient` class which provides an HTTP client for the Softvalue API, covering Bearer token authentication, HTTP method wrappers, token rotation, automatic 401 retry with `onUnauthorized` callback, and error wrapping with `SoftvalueApiError`.

## Test Suites

- **SoftvalueClient** — Single top-level suite with sections for Authorization header, HTTP methods, Token management, 401 retry, SoftvalueApiError, and axiosInstance getter.

## Key Test Cases

- `injects Bearer token in Authorization header` — Confirms auth header format.
- `get/post/put/patch/delete() returns deserialized response data` — HTTP wrapper correctness.
- `updateToken() rotates the token used in subsequent requests` — Runtime token change.
- `retries once on 401 when onUnauthorized returns a new token` — Automatic retry with token rotation.
- `does NOT retry more than once on repeated 401` — Confirms single-retry limit.
- `wraps HTTP error responses in SoftvalueApiError` — Error class with status and message.
- `SoftvalueApiError.name is 'SoftvalueApiError'` — Error identity check.

## Test Setup

- Uses `axios-mock-adapter` on the client's internal axios instance.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
- `makeClient()` helper accepts optional overrides including `onUnauthorized` callback.
