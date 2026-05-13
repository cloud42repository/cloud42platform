# form.service.ts

Business logic service for form persistence. Handles CRUD operations with TypeORM and maps entities to response DTOs.

## Key Exports

- **FormService** — Injectable service with methods: `findAllByUser`, `findById`, `create`, `update`, `remove`, `removeAllByUser`

## Dependencies

- `@nestjs/common` — NotFoundException
- `typeorm` / `@nestjs/typeorm` — Repository for `FormEntity`
- `FormEntity` — TypeORM entity
- `form.dto` — DTO interfaces

## How It Works

The service wraps a TypeORM repository. Key behaviors:

- **findAllByUser** — Queries by `userEmail`, orders by most recently updated.
- **create** — Accepts an optional `id`; if not provided, generates one with a `frm-` prefix + timestamp + random suffix.
- **update** — Partial updates: only fields present in the DTO are applied (name, description, fields, submitActions, status).
- **remove** — Deletes by ID; throws `NotFoundException` if nothing was affected.
- **removeAllByUser** — Bulk-deletes all forms for a given user.

All public methods return `FormResponseDto` (timestamps as ISO strings).
