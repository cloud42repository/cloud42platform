# user-management.service.ts

Manages the local user registry including role assignment, module visibility per user, and login registration. Syncs with the auth service's user signal to keep roles up to date.

## Key Exports

- **`UserManagementService`** — Injectable service exposing `users`, `currentUser`, `currentRole`, `isAdmin`, `canEditModules` computed signals, plus methods for role and module visibility management.

## Dependencies

- `@angular/core` — `Injectable`, `signal`, `computed`, `inject`, `effect`, `untracked`
- `../config/user.types` — `StoredUser`, `UserRole`
- `./auth.service` — `AuthService`

## How It Works

1. **Storage** — Users are persisted in `localStorage` under `cloud42_users`. On construction, the list is loaded and kept in a signal.
2. **Auth sync** — An `effect` watches `auth.user()` and ensures the stored user list reflects any backend role changes. New users are auto-added on first appearance.
3. **`registerLogin(email, name, photoUrl)`** — Ensures the user exists; the very first user is automatically assigned the `admin` role.
4. **`setRole(email, role)`** — Admin-only method to change a user's role.
5. **Module visibility** — `getModuleVisibility`, `setModuleEnabled`, and `setAllModulesEnabled` manage per-user feature flags that control which integration modules are visible.
