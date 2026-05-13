# api.service.ts

A low-level HTTP wrapper service that provides a centralized interface for making REST API calls to the backend. It constructs URLs from path templates with parameter substitution and delegates to Angular's `HttpClient` for all HTTP methods (GET, POST, PUT, PATCH, DELETE).

## Key Exports

- **`ApiService`** — Injectable Angular service that wraps `HttpClient` with URL building, path-param substitution, and query-param handling.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `@angular/common/http` — `HttpClient`, `HttpParams`
- `rxjs` — `Observable`
- `../../environments/environment` — `environment.apiBase`

## How It Works

1. All public methods (`get`, `post`, `put`, `patch`, `delete`) accept a `prefix`, a `pathTemplate` with `:param` placeholders, an optional `pathParams` map, and either `body` or `queryParams`.
2. The private `buildUrl` method replaces `:param` tokens in the path template with URI-encoded values from `pathParams`, then prepends `environment.apiBase` + prefix.
3. For GET and DELETE, query parameters are appended via `HttpParams` (empty values are skipped).
4. Each method returns an `Observable<unknown>`, allowing callers to cast the response to their expected type.
