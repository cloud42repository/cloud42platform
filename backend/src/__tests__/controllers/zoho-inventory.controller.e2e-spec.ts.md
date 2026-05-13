# zoho-inventory.controller.e2e-spec.ts

End-to-end test for the `ZohoInventoryController` that boots the full `AppModule` and exercises Zoho Inventory endpoints including Items, Warehouses, Sales Orders, and Purchase Orders.

## Test Suites

- **ZohoInventoryController (e2e)** — full integration tests against Zoho Inventory endpoints

## Key Test Cases

- **Items** — `listItems()`, `getItem()`, `createItem()`, `updateItem()`, `deleteItem()`
- **Warehouses** — `listWarehouses()`, `getWarehouse()`
- **Sales Orders** — `listSalesOrders()`, `getSalesOrder()`, `createSalesOrder()`, `updateSalesOrder()`, `deleteSalesOrder()`
- **Purchase Orders** — `listPurchaseOrders()`, `getPurchaseOrder()`, `createPurchaseOrder()`, `updatePurchaseOrder()`, `deletePurchaseOrder()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample inventory data (item names, rates, line items with quantities)
