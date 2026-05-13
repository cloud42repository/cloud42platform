# auth-config.service.ts

Manages per-module OAuth/authentication configurations. Loads, caches, saves, and deletes auth configs (e.g., OAuth2 client credentials, API keys) for each integration module from the backend.

## Key Exports

- **`AuthConfigService`** — Injectable service providing CRUD operations on module-level auth configurations stored as a signal-based in-memory cache.

## Dependencies

- `@angular/core` — `Injectable`, `signal`
- `@angular/common/http` — `HttpClient`
- `rxjs` — `firstValueFrom`
- `../config/auth-config.types` — `AuthConfig`, `AuthType`, `ModuleAuthSetting`
- `../../environments/environment` — `environment.apiBase`

## How It Works

1. **`loadAll()`** — Fetches all auth configs from `/auth-configs` on first call, populates an internal `Record<string, AuthConfig>` signal, and sets a `_loaded` flag to avoid refetching.
2. **`getConfig(moduleId)`** — Returns the cached config for a module or a default `{ type: 'none' }`.
3. **`saveConfig(moduleId, config)`** — PUTs the config to the backend and updates the local signal on success.
4. **`deleteConfig(moduleId)`** — DELETEs the config from the backend and removes it from local state.
5. **`getAllSettings()` / `hasConfig()`** — Utility methods for listing all configured modules and checking if a module has a non-trivial config.
