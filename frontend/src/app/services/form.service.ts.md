# form.service.ts

Manages form definitions (dynamic form builders with fields and submit actions) with backend persistence and local state management via Angular signals.

## Key Exports

- **`FormService`** — Injectable service providing CRUD operations (`loadFromApi`, `upsert`, `remove`, `getById`) on `FormDefinition` entities, plus a `getPath` utility.

## Dependencies

- `@angular/core` — `Injectable`, `inject`, `signal`
- `rxjs` — `firstValueFrom`
- `./api.service` — `ApiService`
- `./user-management.service` — `UserManagementService`
- `../config/form.types` — `FormDefinition`, `FormField`, `FormStatus`

## How It Works

1. On construction, `loadFromApi()` is scheduled via `queueMicrotask` to fetch all forms for the current user from `/forms`.
2. Backend DTOs are mapped to typed `FormDefinition` objects including `fields`, `submitActions`, and `status`.
3. **`upsert(form)`** — Optimistically updates the local signal, then calls create or update API methods.
4. **`remove(id)`** — Removes from signal and fires a backend DELETE.
5. **`getPath(obj, path)`** — Resolves dot-notation (with bracket support) paths in objects, used for data binding in form logic.
