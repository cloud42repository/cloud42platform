# zoho-subscriptions.controller.e2e-spec.ts

This end-to-end test validates the `ZohoSubscriptionsController` by loading the full `AppModule` and invoking controller methods directly to verify integration with the real service layer for plans, addons, coupons, customers, and subscriptions.

## Test Suites

- **ZohoSubscriptionsController (e2e)** — Full integration test of all Zoho Subscriptions endpoints

## Key Test Cases

- `should be defined` — Controller instantiation check
- **Plans**: `listPlans`, `getPlan`, `createPlan`, `updatePlan`, `deletePlan`
- **Addons**: `listAddons`, `getAddon`
- **Coupons**: `listCoupons`, `getCoupon`
- **Customers**: `listCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`, `deleteCustomer`
- **Subscriptions**: `listSubscriptions`, `getSubscription`, `createSubscription`, `updateSubscription`, `cancelSubscription`, `reactivateSubscription`

## Test Setup

- Imports the full `AppModule` to create a complete application context
- Uses `beforeAll`/`afterAll` for module lifecycle (compile and close)
- Controller methods are called directly with test data (plan codes, customer IDs, minimal payloads with required fields)
- All assertions verify that results are defined
