# module-visibility.service.ts

Controls which integration modules are visible to the current user based on their role and per-user visibility settings. Acts as a facade over `UserManagementService` module visibility data.

## Key Exports

- **`ModuleVisibilityService`** — Injectable service exposing an `enabledModules` computed signal and methods `isEnabled`, `setEnabled`, `enableAll`, `disableAll`.

## Dependencies

- `@angular/core` — `Injectable`, `computed`, `inject`
- `../config/endpoints` — `MODULES`
- `./user-management.service` — `UserManagementService`

## How It Works

1. **`enabledModules`** — A computed signal that filters the global `MODULES` list based on the current user's `moduleVisibility` map. Admin/Manager roles default to enabled; regular users default to disabled.
2. **`isEnabled(moduleId)`** — Checks a single module's visibility for the current user, applying the same role-based default logic.
3. **`setEnabled(moduleId, enabled)`** — Delegates to `UserManagementService.setModuleEnabled` for the current user.
4. **`enableAll()` / `disableAll()`** — Bulk-toggles all modules from the `MODULES` config for the current user.
