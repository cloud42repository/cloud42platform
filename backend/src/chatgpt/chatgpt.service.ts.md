# chatgpt.service.ts

Injectable NestJS service that manages per-user ChatGPT API clients. It resolves the current user's API credentials from the auth-config store and caches client instances for 10 minutes, falling back to a default client configured via environment variables.

## Key Exports

- **`ChatGPTService`** — Service providing methods for models, chat completions, embeddings, image generation, and moderation.

## Dependencies

- `@nestjs/common` — Injectable, Logger
- `@nestjs/config` — ConfigService (reads OPENAI_API_KEY, OPENAI_ORG_ID, OPENAI_BASE_URL)
- `../auth-config/auth-config.service` — AuthConfigService (per-user credential lookup)
- `../auth-module/user-context` — getCurrentUserEmail
- `./ChatGPTClient` — ChatGPTClient
- `./chatgpt.dto` — Request DTOs

## How It Works

1. On instantiation, creates a `defaultClient` using environment-level OpenAI credentials.
2. `getClient()` resolves the current user's email via async-local-storage context; if a per-user config exists in the `auth_configs` table (key `__chatgpt__`), it creates and caches a dedicated `ChatGPTClient` with that user's API key.
3. Each public method (`listModels`, `createChatCompletion`, etc.) awaits `getClient()` and delegates to the resolved client instance.
4. Cached clients expire after 10 minutes to pick up credential changes.
