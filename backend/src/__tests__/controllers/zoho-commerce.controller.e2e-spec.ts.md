# zoho-commerce.controller.e2e-spec.ts

End-to-end tests for the `ZohoCommerceController`, covering product management, category operations, customer listing, and order lifecycle (create, status update, cancel) for the Zoho Commerce integration.

## Test Suites

- **ZohoCommerceController (e2e)** — Tests all Zoho Commerce endpoints with the full AppModule.

## Key Test Cases

- **Products**: `listProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`
- **Categories**: `listCategories`, `getCategory`, `createCategory`, `deleteCategory`
- **Customers**: `listCustomers`, `getCustomer`
- **Orders**: `listOrders`, `getOrder`, `createOrder`, `updateOrderStatus`, `cancelOrder`

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration or mock data.
- Module fixture is closed in `afterAll`.
