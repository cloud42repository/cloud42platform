# auth-config.service.ts

Service for persisting and retrieving per-user, per-module authentication configurations in the database.

## Key Exports

- **AuthConfigService** — injectable NestJS service providing `findAll`, `findOne`, `save`, `remove`, and `removeAll` methods.

## Dependencies

- `@nestjs/common` — `Injectable`, `Logger`
- `@nestjs/typeorm` — `InjectRepository`
- `typeorm` — `Repository`
- `AuthConfigEntity` — TypeORM entity with composite key (userEmail, moduleId)
- `AuthConfigDto`, `AuthConfigResponseDto` — DTO interfaces

## How It Works

Injects a TypeORM `Repository<AuthConfigEntity>` and provides:
- **findAll(userEmail)** — returns all auth configs for a user, ordered by moduleId.
- **findOne(userEmail, moduleId)** — returns a single config or `null`.
- **save(userEmail, moduleId, config)** — upserts: updates the config if it exists, otherwise creates a new entity.
- **remove(userEmail, moduleId)** — deletes a specific config entry.
- **removeAll(userEmail)** — deletes all configs for a user (used during account cleanup).

All mutations are logged via NestJS `Logger`.
