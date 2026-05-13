# user-api.service.ts

A thin HTTP client layer for the `/users` backend API endpoints. Provides typed Observable-returning methods for all user management operations including registration, approval, role changes, and password management.

## Key Exports

- **`UserResponse`** — Interface for the backend user DTO (email, name, role, status, moduleVisibility, timestamps).
- **`UserApiService`** — Injectable service with methods mapping to each `/api/users` endpoint.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `rxjs` — `Observable`
- `./api.service` — `ApiService`
- `../config/user.types` — `StoredUser`, `UserRole`

## How It Works

1. Each method delegates to `ApiService` with the appropriate HTTP verb, path template, and parameters.
2. **CRUD** — `listAll`, `getByEmail`, `remove` for basic user management.
3. **Auth flows** — `registerLogin` (on OAuth login), `register` (self-registration), `setPassword` (token-based password set).
4. **Admin actions** — `setRole`, `approve`, `revoke`, `resendInvite` for admin user lifecycle management.
5. **Module visibility** — `setModuleVisibility` (single toggle) and `setAllModulesEnabled` (bulk toggle) for feature-flag management.
