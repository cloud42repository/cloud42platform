# form.controller.ts

REST controller for form CRUD operations. Exposes endpoints to list, get, create, update, and delete forms scoped to a user.

## Key Exports

- **FormController** — NestJS controller handling all `/api/forms` routes

## Dependencies

- `@nestjs/common` — Controller decorators (Get, Post, Put, Delete, Param, Query, Body)
- `FormService` — Business logic for form persistence
- `form.dto` — Request DTO interfaces (CreateFormDto, UpdateFormDto)

## How It Works

Each method maps an HTTP operation to the corresponding service call. Listing forms requires a `userEmail` query parameter. Individual form access uses the `:id` path parameter. All routes require authentication.
