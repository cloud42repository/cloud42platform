# zoho-oauth.module.ts

Defines the NestJS module that bundles the Zoho OAuth controller and service, registered globally so any module in the application can inject `ZohoOAuthService` without explicit imports.

## Key Exports

- **ZohoOAuthModule** — Global NestJS module that provides and exports `ZohoOAuthService` and registers `ZohoOAuthController`.

## Dependencies

- `@nestjs/common` — Global, Module decorators
- `ZohoOAuthController` — REST controller exposing OAuth endpoints
- `ZohoOAuthService` — Service handling OAuth token lifecycle

## How It Works

The module is decorated with `@Global()` making `ZohoOAuthService` available application-wide without needing to import this module in every consumer. It registers the controller for HTTP routing and exports the service for dependency injection.
