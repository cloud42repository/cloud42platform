# application.service.ts

Service responsible for CRUD operations on application entities. Handles persistence via TypeORM and entity-to-DTO conversion.

## Key Exports

- **ApplicationService** — injectable NestJS service providing `findAllByUser`, `findById`, `create`, `update`, `remove`, and `removeAllByUser` methods.

## Dependencies

- `@nestjs/common` — `Injectable`, `NotFoundException`
- `@nestjs/typeorm` — `InjectRepository`
- `typeorm` — `Repository`
- `ApplicationEntity` — TypeORM entity
- `CreateApplicationDto`, `UpdateApplicationDto`, `ApplicationResponseDto` — DTO interfaces

## How It Works

Injects a TypeORM `Repository<ApplicationEntity>` and provides:
- **findAllByUser** — queries by `userEmail`, ordered by `updatedAt DESC`.
- **findById** — finds by ID, throws `NotFoundException` if missing.
- **create** — generates an ID if not provided, persists the entity with defaults for optional fields.
- **update** — patches only provided fields (name, description, pages, navigation, status) and saves.
- **remove** — deletes by ID, throws if no rows affected.
- **removeAllByUser** — bulk-deletes all applications for a user.

A private `toDto` method serializes dates to ISO strings and ensures default values.
