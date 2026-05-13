# zoho-invoice.controller.e2e-spec.ts

End-to-end test for the `ZohoInvoiceController` that boots the full `AppModule` and exercises Zoho Invoice endpoints including Customers, Invoices (with send), Estimates, Recurring Invoices, and Payments.

## Test Suites

- **ZohoInvoiceController (e2e)** — full integration tests against Zoho Invoice endpoints

## Key Test Cases

- **Customers** — `listCustomers()`, `getCustomer()`, `createCustomer()`, `updateCustomer()`, `deleteCustomer()`
- **Invoices** — `listInvoices()`, `getInvoice()`, `createInvoice()`, `updateInvoice()`, `deleteInvoice()`, `sendInvoice()`
- **Estimates** — `listEstimates()`, `getEstimate()`, `createEstimate()`, `updateEstimate()`, `deleteEstimate()`
- **Recurring Invoices** — `listRecurringInvoices()`, `getRecurringInvoice()`, `createRecurringInvoice()`, `deleteRecurringInvoice()`
- **Payments** — `listPayments()`, `createPayment()`, `deletePayment()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample invoice data (customer names, line items, amounts)
