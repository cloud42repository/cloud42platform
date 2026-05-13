# notification.module.ts

NestJS module that registers the notification feature — entity, controller, and service.

## Key Exports

- **NotificationModule** — NestJS module that exports `NotificationService` for use by other modules (e.g., workflow execution).

## Dependencies

- `@nestjs/common` — `Module`
- `@nestjs/typeorm` — `TypeOrmModule.forFeature`
- `NotificationEntity` — TypeORM entity
- `NotificationController` — REST controller
- `NotificationService` — CRUD service

## How It Works

Registers `NotificationEntity` with TypeORM, declares the controller, and provides + exports `NotificationService`. The export allows other modules (like `WorkflowModule`) to inject the service for creating notifications programmatically during workflow execution.
