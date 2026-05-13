# zoho-subscriptions.service.ts

Angular service providing an HTTP client for the Zoho Subscriptions recurring billing API. Manages plans, addons, coupons, customers, and subscriptions with lifecycle actions.

## Key Exports

- **ZohoSubscriptionsService** — Injectable Angular service (root-provided) for Zoho Subscriptions operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-subscriptions'` and provides methods grouped by resource:

1. **Plans** — List, get, create, update, delete subscription plans (identified by code).
2. **Addons** — List and get addon components.
3. **Coupons** — List and get discount coupons.
4. **Customers** — List, get, create, update, delete customer records.
5. **Subscriptions** — List, get, create, update subscriptions; cancel or reactivate a subscription.
