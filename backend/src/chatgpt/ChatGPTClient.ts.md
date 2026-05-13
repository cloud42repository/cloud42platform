# ChatGPTClient.ts

Axios-based HTTP client for the OpenAI API. Handles authentication via Bearer token, optional organization header, request/response interceptors for error wrapping, and supports mock mode for testing.

## Key Exports

- **`ChatGPTClientConfig`** — Configuration interface (apiKey, orgId, baseUrl, timeout)
- **`ChatGPTApiError`** — Custom error class with status code and response data
- **`ChatGPTClient`** — Main client class with typed methods for OpenAI endpoints

## Dependencies

- `axios` — HTTP client (AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig)
- `../mock/mock-adapter` — attachMockAdapter (for MOCK_MODE)
- `./chatgpt.dto` — All request/response type imports

## How It Works

1. Constructor creates an Axios instance with the configured base URL (default: `https://api.openai.com/v1`) and timeout (default: 60s).
2. Request interceptor injects `Authorization: Bearer <apiKey>` and optionally `OpenAI-Organization` headers.
3. Response interceptor catches errors and wraps them in `ChatGPTApiError` with status and message.
4. If `MOCK_MODE=true`, attaches a mock adapter for offline/test operation.
5. Provides typed methods: `listModels()`, `getModel()`, `createChatCompletion()`, `createEmbedding()`, `generateImage()`, `createModeration()`.
6. Exposes generic `get`, `post`, `delete` helpers and `updateApiKey()` for runtime key rotation.
