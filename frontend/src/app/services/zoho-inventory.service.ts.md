# zoho-inventory.service.ts

Angular service providing an HTTP client for the Zoho Inventory API. Manages items, warehouses, sales orders, and purchase orders with full CRUD operations.

## Key Exports

- **ZohoInventoryService** — Injectable Angular service (root-provided) for Zoho Inventory operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-inventory'` and provides methods grouped by resource:

1. **Items** — List, get, create, update, delete inventory items.
2. **Warehouses** — List and get warehouse records.
3. **Sales Orders** — List, get, create, update, delete sales orders.
4. **Purchase Orders** — List, get, create, update, delete purchase orders.
