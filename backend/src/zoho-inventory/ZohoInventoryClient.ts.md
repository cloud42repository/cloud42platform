# ZohoInventoryClient.ts

HTTP client class for the Zoho Inventory v1 API, extending the shared `ZohoBaseClient` to provide typed methods for items, warehouses, sales orders, and purchase orders.

## Key Exports

- `ZohoInventoryConfig` — Configuration interface extending `ZohoCredentials` with required `organizationId` and optional `region`/`apiBaseUrl`
- `ZohoInventoryClient` — Client class with methods for all Zoho Inventory API endpoints

## Dependencies

- `../base/ZohoBaseClient` — Base HTTP client with get/post/put/delete methods and token management
- `../base/types` — `ZohoCredentials`, `ZOHO_API_BASE`, `ZohoRegion`
- `./zoho-inventory.dto` — All DTO/interface types for request/response data

## How It Works

The constructor derives the API base URL from the region (using `ZOHO_API_BASE` mapping, defaulting to "com") and sets `organization_id` as a default query parameter. Methods map to Zoho Inventory REST endpoints: full CRUD for items, list/get for warehouses, full CRUD for sales orders, and full CRUD for purchase orders. All methods return typed Promises.
