# workflow.module.ts

NestJS module that wires together the workflow feature — entity registration, controller, and services.

## Key Exports

- **WorkflowModule** — NestJS module that exports `WorkflowService` and `WorkflowExecutionService` for use by other modules.

## Dependencies

- `@nestjs/common` — `Module`
- `@nestjs/typeorm` — `TypeOrmModule.forFeature`
- `WorkflowEntity` — TypeORM entity
- `WorkflowController` — REST controller
- `WorkflowService` — CRUD service
- `WorkflowExecutionService` — execution engine
- `NotificationModule` — provides `NotificationService`
- `MicrosoftGraphModule` — provides `MicrosoftGraphService`

## How It Works

Registers `WorkflowEntity` with TypeORM, imports `NotificationModule` and `MicrosoftGraphModule` as dependencies, declares the controller, and provides + exports both services so other modules (e.g., scheduled tasks) can use them.
