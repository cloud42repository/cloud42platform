# workflow.service.ts

Service responsible for CRUD operations on workflow entities. It interacts with the database via TypeORM and converts entities to response DTOs.

## Key Exports

- **WorkflowService** — injectable NestJS service providing `findAllByUser`, `findById`, `create`, `update`, `remove`, and `removeAllByUser` methods.

## Dependencies

- `@nestjs/common` — `Injectable`, `NotFoundException`
- `@nestjs/typeorm` — `InjectRepository`
- `typeorm` — `Repository`
- `WorkflowEntity` — the TypeORM entity for workflows
- `CreateWorkflowDto`, `UpdateWorkflowDto`, `WorkflowResponseDto` — DTO interfaces

## How It Works

The service injects a TypeORM `Repository<WorkflowEntity>` and provides standard CRUD:
- **findAllByUser** — queries workflows by `userEmail`, ordered by `updatedAt DESC`, and maps each to a DTO.
- **findById** — looks up a workflow by ID, throwing `NotFoundException` if not found.
- **create** — generates an ID (if not provided), persists a new entity, and returns the DTO.
- **update** — patches only the provided fields on the existing entity and saves.
- **remove** — deletes by ID, throwing if no rows affected.
- **removeAllByUser** — bulk-deletes all workflows for a user.

A private `toDto` helper converts entity fields (including date serialization) to the response shape.
