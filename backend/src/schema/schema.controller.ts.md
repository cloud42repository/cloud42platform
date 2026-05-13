# schema.controller.ts

Simple REST controller that exposes the platform's API schema as a public endpoint — no authentication required.

## Key Exports

- **SchemaController** — NestJS controller registered at `/schema` with a single GET endpoint.

## Dependencies

- `@nestjs/common` — `Controller`, `Get`
- `SCHEMA` — the full API schema object imported from `../shared/schema`
- `Public` — decorator that bypasses JWT authentication

## How It Works

Exposes a single `GET /api/schema` endpoint decorated with `@Public()` so it can be accessed without authentication. Returns the `SCHEMA` constant, which describes the platform's modules, endpoints, and their configurations. This is used by the frontend for dynamic form generation, workflow builder endpoint selection, and API documentation.
