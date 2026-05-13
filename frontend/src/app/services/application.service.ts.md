# application.service.ts

Manages the lifecycle of user-built applications (multi-page app definitions) with full CRUD operations against the backend API and optimistic local state updates via Angular signals.

## Key Exports

- **`ApplicationService`** — Injectable service providing `loadFromApi`, `upsert`, `remove`, and `getById` for `ApplicationDefinition` entities.

## Dependencies

- `@angular/core` — `Injectable`, `inject`, `signal`
- `rxjs` — `firstValueFrom`
- `./api.service` — `ApiService`
- `./user-management.service` — `UserManagementService`
- `../config/application.types` — `ApplicationDefinition`, `AppPage`, `AppNavigation`, `ApplicationStatus`

## How It Works

1. On construction, `loadFromApi()` is scheduled via `queueMicrotask` to fetch all applications for the current user (identified by email) from `/applications`.
2. Backend DTOs are mapped to typed `ApplicationDefinition` objects via `mapFromApi`.
3. **`upsert(app)`** — Updates the local signal optimistically, then calls `createOnApi` or `updateOnApi` depending on whether the app already exists.
4. **`remove(id)`** — Removes from local state and fires a DELETE to the backend.
5. **`getById(id)`** — Finds an app in the current signal value.
