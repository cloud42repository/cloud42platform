# ZohoCommerceClient.spec.ts

Tests the `ZohoCommerceClient` class which wraps the Zoho Commerce Store API v1, covering base URL, auth headers, and CRUD operations for products, categories, customers, and orders (including status updates and cancellation).

## Test Suites

- **ZohoCommerceClient** — Single top-level suite with sections for Products, Categories, Customers, and Orders.

## Key Test Cases

- `uses the correct base URL` — Verifies `commerce.zoho.com/store/api/v1`.
- `injects auth header` — Confirms Zoho-oauthtoken format.
- `listProducts/getProduct/createProduct/updateProduct/deleteProduct` — Product CRUD.
- `listCategories/createCategory/deleteCategory` — Category management.
- `listCustomers/getCustomer` — Customer retrieval.
- `listOrders/getOrder/createOrder/updateOrderStatus/cancelOrder` — Full order lifecycle including status transitions.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
