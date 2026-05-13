# softvalue.module.ts

NestJS module that bundles the Softvalue controller and service, exporting the service for use by other modules.

## Key Exports

- **`SoftvalueModule`** — NestJS module registering SoftvalueController and SoftvalueService.

## Dependencies

- `@nestjs/common` — Module decorator
- `./softvalue.service` — SoftvalueService
- `./softvalue.controller` — SoftvalueController

## How It Works

Declares the controller and service as module members, and exports `SoftvalueService` so other modules can inject it directly.
