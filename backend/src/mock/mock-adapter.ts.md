# mock-adapter.ts

Provides a comprehensive mock HTTP adapter for development and testing. When `MOCK_MODE=true`, this replaces real Zoho API calls with an in-memory data store that supports full CRUD operations across all resource types.

## Key Exports

- **`attachMockAdapter(http: AxiosInstance)`** — Function that attaches `axios-mock-adapter` to an Axios instance, intercepting all requests with simulated responses.

## Dependencies

- `axios` — `AxiosInstance` type.
- `crypto` — `randomInt` for realistic mock data.
- `axios-mock-adapter` — CJS module that intercepts Axios requests.

## How It Works

1. **In-memory store** — A `Map<string, Map<string, StoreRecord>>` keyed by resource name, where each resource has a collection of mock records keyed by ID.
2. **Seeding** — On first attach, `seedStore()` pre-populates 5 records for every known resource type (CRM leads, Books invoices, Desk tickets, etc.) with realistic field data.
3. **Resource extraction** — `resourceFromUrl(url)` walks URL path segments backwards to identify the resource name, skipping IDs and action segments. Applies naive singularization.
4. **ID extraction** — `idFromUrl(url)` detects numeric or `mock-*` IDs in the last path segment.
5. **Request handling** — The mock adapter matches GET (list/single), POST (create), PUT/PATCH (update), and DELETE requests, manipulating the in-memory store accordingly and returning Zoho-style response envelopes.
6. **Record builders** — `buildRecord(resourceName, id)` generates resource-specific mock data with realistic field names and values based on the resource type.
