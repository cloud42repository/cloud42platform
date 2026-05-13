# dashboard.service.ts

Manages dashboard definitions (collections of widgets) with backend persistence and local signal-based state. Also provides a token interpolation utility for resolving widget data references in templates.

## Key Exports

- **`DashboardService`** — Injectable service for CRUD operations on `Dashboard` entities, plus a `interpolateTokens` helper and `getPath` dot-notation resolver.

## Dependencies

- `@angular/core` — `Injectable`, `inject`, `signal`
- `rxjs` — `firstValueFrom`
- `./api.service` — `ApiService`
- `./user-management.service` — `UserManagementService`
- `../config/dashboard.types` — `Dashboard`, `DashboardWidget`, `DashboardStatus`

## How It Works

1. On construction, `loadFromApi()` fetches dashboards for the current user from `/dashboards` and stores them in a reactive signal.
2. **`upsert(dashboard)`** — Optimistically updates the signal, then creates or updates on the backend.
3. **`remove(id)`** — Removes from local state and issues a DELETE request.
4. **`interpolateTokens(template, widgetResults)`** — Replaces `{{widget.X.path}}` tokens in a string by resolving dot-notation paths against widget result data.
5. **`getPath(obj, path)`** — Generic dot-notation accessor supporting bracket notation (e.g., `items[0].name`).
