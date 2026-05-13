# main.ts

Entry point for the NestJS backend application. Bootstraps the app, configures CORS, cookie parsing, a global API prefix (`/api`), and a global exception filter for upstream API errors. Supports a `MOCK_MODE` environment variable that disables real API calls.

## Key Exports

- `bootstrap()` — Async function that creates and starts the NestJS application on the configured port (default 3000)

## Dependencies

- `@nestjs/core` — NestFactory for application creation
- `cookie-parser` — Middleware for parsing HTTP cookies (required for refresh tokens)
- `./app.module` — Root application module
- `./shared/zoho-api-exception.filter` — Global exception filter for forwarding upstream API errors

## How It Works

1. Creates the NestJS application from `AppModule`
2. Attaches `cookie-parser` middleware
3. Reads `CORS_ORIGIN` env variable (comma-separated allowed origins) and configures a dynamic CORS origin validator
4. Sets the global route prefix to `api`
5. Registers `ZohoApiExceptionFilter` globally to forward upstream errors instead of returning generic 500s
6. Listens on `PORT` (default 3000)
