# ZohoInventoryClient.spec.ts

Tests the `ZohoInventoryClient` class which wraps the Zoho Inventory API v1, covering base URL, organization_id injection, and CRUD operations for items, warehouses, sales orders, and purchase orders.

## Test Suites

- **ZohoInventoryClient** — Single top-level suite with sections for Items, Warehouses, Sales Orders, and Purchase Orders.

## Key Test Cases

- `uses the correct base URL` — Verifies `zohoapis.com/inventory/v1`.
- `appends organization_id to every request` — Automatic org param injection.
- `listItems/getItem/createItem/updateItem/deleteItem` — Item CRUD.
- `listWarehouses/getWarehouse` — Warehouse retrieval.
- `listSalesOrders/createSalesOrder/deleteSalesOrder` — Sales order management.
- `listPurchaseOrders/createPurchaseOrder` — Purchase order management.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `makeClient()` configures the client with a test organization ID.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
