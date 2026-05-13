# schema.module.ts

Minimal NestJS module that registers the schema controller.

## Key Exports

- **SchemaModule** — NestJS module with no providers or exports, only a controller.

## Dependencies

- `@nestjs/common` — `Module`
- `SchemaController` — the REST controller

## How It Works

Simply declares `SchemaController` so it gets registered with the NestJS application. No services, entities, or imports are needed since the controller only returns a static constant (`SCHEMA`) from the shared module.
