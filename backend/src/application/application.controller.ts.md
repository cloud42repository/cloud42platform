# application.controller.ts

REST controller for managing multi-page applications. Exposes standard CRUD endpoints for the application builder feature.

## Key Exports

- **ApplicationController** — NestJS controller registered at `/applications` with endpoints for listing, getting, creating, updating, and deleting applications.

## Dependencies

- `@nestjs/common` — decorators (`Controller`, `Get`, `Post`, `Put`, `Delete`, `Query`, `Param`, `Body`)
- `ApplicationService` — handles persistence logic
- `CreateApplicationDto`, `UpdateApplicationDto` — request DTOs

## How It Works

The controller exposes five REST endpoints:
1. `GET /applications?userEmail=` — lists all applications for a user
2. `GET /applications/:id` — retrieves a single application by ID
3. `POST /applications` — creates a new application
4. `PUT /applications/:id` — updates an existing application
5. `DELETE /applications/:id` — deletes an application

Each method delegates to `ApplicationService` and returns the result directly.
