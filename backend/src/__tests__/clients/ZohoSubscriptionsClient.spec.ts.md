# ZohoSubscriptionsClient.spec.ts

Tests the `ZohoSubscriptionsClient` class, verifying correct base URL, organization ID injection, and CRUD operations for plans, customers, subscriptions (including cancellation), addons, and coupons against the Zoho Subscriptions API v1.

## Test Suites

- **ZohoSubscriptionsClient** — Main suite covering URL validation, org parameter injection, and all subscription management endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `zohoapis.com/subscriptions/v1`
- `appends organization_id to every request` — Ensures org ID is injected as query parameter
- `listPlans()` / `getPlan()` / `createPlan()` / `updatePlan()` / `deletePlan()` — Full plan CRUD
- `listCustomers()` / `createCustomer()` / `deleteCustomer()` — Customer management
- `listSubscriptions()` / `getSubscription()` / `createSubscription()` / `cancelSubscription()` — Subscription lifecycle including cancellation
- `listAddons()` — Addon listing
- `listCoupons()` — Coupon listing

## Test Setup

- **beforeEach**: Creates a new `ZohoSubscriptionsClient` instance with `PassthroughAuth` and a fixed organization ID; sets up `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
