# impossible-cloud.module.ts

NestJS module that bundles the Impossible Cloud controller and service, exporting the service for use by other modules.

## Key Exports

- **`ImpossibleCloudModule`** — NestJS module registering ImpossibleCloudController and ImpossibleCloudService.

## Dependencies

- `@nestjs/common` — Module decorator
- `./impossible-cloud.service` — ImpossibleCloudService
- `./impossible-cloud.controller` — ImpossibleCloudController

## How It Works

Declares the controller and service as module members, and exports `ImpossibleCloudService` so other modules can inject it directly.
