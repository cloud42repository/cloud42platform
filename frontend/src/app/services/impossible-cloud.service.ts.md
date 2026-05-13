# impossible-cloud.service.ts

Angular service that provides a typed HTTP client for the Impossible Cloud Management Console API. It wraps `ApiService` calls to manage regions, contracts, partners, members, and storage accounts, including usage reporting.

## Key Exports

- **ImpossibleCloudService** — Injectable Angular service (root-provided) with methods for all Impossible Cloud API endpoints.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `rxjs` — `Observable`
- `./api.service` — `ApiService` (HTTP abstraction layer)
- `./impossible-cloud.types` — All IC type interfaces and DTOs

## How It Works

The service uses a shared `PREFIX = '/impossible-cloud'` route prefix and delegates all HTTP operations to `ApiService`. Methods are organized into logical groups:

1. **Regions & Contracts** — List available regions and contracts, retrieve contract partners.
2. **Partners** — Full CRUD for partner entities under the distributor.
3. **Members** — List, create, and delete MC user members within a partner.
4. **Partner Storage Accounts** — Manage storage accounts scoped to a partner, including usage queries.
5. **Own Storage Accounts** — Manage the caller's own storage accounts and retrieve aggregated or per-account usage data.

Each method returns a typed `Observable<T>` using explicit casts from the generic `ApiService` responses.
