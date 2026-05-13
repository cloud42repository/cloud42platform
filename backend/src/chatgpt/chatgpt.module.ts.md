# chatgpt.module.ts

NestJS module that bundles the ChatGPT controller and service together, making the `ChatGPTService` available for injection into other modules.

## Key Exports

- **`ChatGPTModule`** — NestJS module registering ChatGPTController and ChatGPTService, and exporting the service.

## Dependencies

- `@nestjs/common` — Module decorator
- `./chatgpt.controller` — ChatGPTController
- `./chatgpt.service` — ChatGPTService

## How It Works

Declares `ChatGPTController` as the controller, `ChatGPTService` as a provider, and exports the service so other modules can inject it without re-importing the controller.
