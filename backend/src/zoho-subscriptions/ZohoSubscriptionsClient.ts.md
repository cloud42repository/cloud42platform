# ZohoSubscriptionsClient.ts

Low-level HTTP client for the Zoho Subscriptions v1 REST API, extending `ZohoBaseClient` with region-aware URL construction and typed methods for all subscription resources.

## Key Exports

- **ZohoSubscriptionsConfig** — Configuration interface extending `ZohoCredentials` with required `organizationId` and optional `region`
- **ZohoSubscriptionsClient** — Client class with full CRUD methods for plans, addons, coupons, customers, and subscriptions

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with token management
- `ZohoCredentials`, `ZOHO_API_BASE`, `ZohoRegion` from `../base/types` — Credential and region types
- DTO types from `./zoho-subscriptions.dto` — Type definitions for all entities

## How It Works

1. Constructor uses `ZOHO_API_BASE[region]` to build a region-specific API URL (e.g., `https://www.zohoapis.com/subscriptions/v1`). Passes `organization_id` as a default query parameter.
2. **Plans**: `listPlans`, `getPlan`, `createPlan`, `updatePlan`, `deletePlan` — Full CRUD.
3. **Addons**: `listAddons`, `getAddon` — Read-only addon access.
4. **Coupons**: `listCoupons`, `getCoupon` — Read-only coupon access.
5. **Customers**: `listCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`, `deleteCustomer` — Full CRUD.
6. **Subscriptions**: `listSubscriptions`, `getSubscription`, `createSubscription`, `updateSubscription`, `cancelSubscription`, `reactivateSubscription` — Full lifecycle management.
