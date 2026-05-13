# SoftvalueClient.ts

Axios-based HTTP client for the Softvalue API. Authenticates with a Bearer token, includes automatic 401 retry with an optional `onUnauthorized` hook for token rotation, and supports mock mode for testing.

## Key Exports

- **`SoftvalueClientConfig`** — Configuration interface (token, baseUrl, timeout, onUnauthorized hook)
- **`SoftvalueApiError`** — Custom error class with status code and full Axios response
- **`SoftvalueClient`** — Main client class with generic HTTP methods and token management

## Dependencies

- `axios` — HTTP client (AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig)
- `../mock/mock-adapter` — attachMockAdapter (for MOCK_MODE)

## How It Works

1. Constructor creates an Axios instance with base URL (default: `https://api.softvalue.com/v1`) and timeout (default: 30s).
2. Request interceptor injects `Authorization: Bearer <token>` on every request.
3. Response interceptor handles errors:
   - On 401: calls the optional `onUnauthorized` hook to obtain a fresh token, then retries the request once.
   - On other errors (≥400): wraps in `SoftvalueApiError` with the status and message.
4. If `MOCK_MODE=true`, attaches a mock adapter for offline/test operation.
5. Provides generic typed HTTP methods: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`.
6. `updateToken()` / `getToken()` allow runtime token management.
7. Exposes the raw `axiosInstance` for advanced use cases like file uploads or streaming.
