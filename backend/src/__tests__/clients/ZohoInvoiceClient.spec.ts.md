# ZohoInvoiceClient.spec.ts

Tests the `ZohoInvoiceClient` class, verifying correct URL construction (including region-specific base URLs), organization ID injection into requests, and CRUD operations for invoices, customers, estimates, and payments against the Zoho Invoice API v3.

## Test Suites

- **ZohoInvoiceClient** — Main suite covering URL construction, organization parameter injection, and all resource endpoint methods.

## Key Test Cases

- `uses the correct default base URL` — Verifies default base URL contains `zohoapis.com/invoice/v3`
- `uses EU base URL for region=eu` — Confirms EU region URL variant
- `appends organization_id to every request` — Ensures org ID is injected as a query parameter
- `listInvoices()` / `getInvoice()` / `createInvoice()` / `updateInvoice()` / `sendInvoice()` / `deleteInvoice()` — Full CRUD + email sending for invoices
- `listCustomers()` / `createCustomer()` / `deleteCustomer()` — Customer management endpoints
- `listEstimates()` / `createEstimate()` — Estimate endpoints
- `listPayments()` / `createPayment()` — Customer payment endpoints

## Test Setup

- **beforeEach**: Creates a new `ZohoInvoiceClient` instance with a `PassthroughAuth` provider (hardcoded token) and sets up an `axios-mock-adapter` on the client's axios instance.
- **afterEach**: Restores the mock adapter to clean state.
- A `makeClient()` factory function accepts an optional region parameter for testing region-specific URL construction.
