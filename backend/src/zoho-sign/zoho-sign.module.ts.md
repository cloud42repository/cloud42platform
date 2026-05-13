# zoho-sign.module.ts

NestJS module that bundles the Zoho Sign controller and service, making the service available for injection in other modules.

## Key Exports

- **ZohoSignModule** — Module that registers `ZohoSignController` and exports `ZohoSignService`.

## Dependencies

- `@nestjs/common` — Module decorator
- `ZohoSignController` — REST controller
- `ZohoSignService` — Service provider

## How It Works

Declares the controller and service as module members, and exports the service so other modules can import `ZohoSignModule` to use `ZohoSignService` directly.
