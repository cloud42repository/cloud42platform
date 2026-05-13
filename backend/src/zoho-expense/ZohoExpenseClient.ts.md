# ZohoExpenseClient.ts

HTTP client class for the Zoho Expense v1 API, extending the shared `ZohoBaseClient` to provide typed methods for categories, expenses, expense reports (including submit/approve actions), and advance payments.

## Key Exports

- `ZohoExpenseConfig` — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- `ZohoExpenseClient` — Client class with methods for all Zoho Expense API endpoints

## Dependencies

- `../base/ZohoBaseClient` — Base HTTP client with get/post/put/delete methods and token management
- `../base/types` — `ZohoCredentials` interface
- `./zoho-expense.dto` — All DTO/interface types for request/response data

## How It Works

The constructor configures the base URL (defaulting to `https://expense.zoho.com/api/v1`) and sets `organization_id` as a default query parameter if provided. Methods map directly to Zoho Expense REST endpoints: `listCategories`/`getCategory` for categories, full CRUD for expenses, full CRUD plus `submitReport`/`approveReport` for reports, and `listAdvances`/`getAdvance` for advance payments. All methods return typed Promises.
