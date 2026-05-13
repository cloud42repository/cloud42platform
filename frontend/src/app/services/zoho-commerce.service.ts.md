# zoho-commerce.service.ts

Angular service providing an HTTP client for the Zoho Commerce e-commerce API. Manages products, categories, customers, and orders including order lifecycle actions.

## Key Exports

- **ZohoCommerceService** — Injectable Angular service (root-provided) for Zoho Commerce operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-commerce'` and provides methods grouped by resource:

1. **Products** — List, get, create, update, delete products.
2. **Categories** — List, get, create, delete product categories.
3. **Customers** — List and get customer records.
4. **Orders** — List, get, create orders; update order status; cancel an order.
