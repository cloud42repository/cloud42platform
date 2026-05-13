# microsoft-graph.module.ts

NestJS module that bundles the Microsoft Graph controller and service, importing `AuthConfigModule` for credential management and exporting the service.

## Key Exports

- **`MicrosoftGraphModule`** — NestJS module registering MicrosoftGraphController and MicrosoftGraphService.

## Dependencies

- `@nestjs/common` — Module decorator
- `./microsoft-graph.controller` — MicrosoftGraphController
- `./microsoft-graph.service` — MicrosoftGraphService
- `../auth-config/auth-config.module` — AuthConfigModule

## How It Works

Imports `AuthConfigModule` to enable per-user credential lookups, declares the controller and service, and exports `MicrosoftGraphService` for injection by other modules.
