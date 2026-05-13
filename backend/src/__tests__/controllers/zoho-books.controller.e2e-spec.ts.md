# zoho-books.controller.e2e-spec.ts

End-to-end tests for the `ZohoBooksController`, covering full CRUD operations on contacts, invoices (including send/void), bills, expenses, payments, and items for the Zoho Books integration.

## Test Suites

- **ZohoBooksController (e2e)** — Tests all Zoho Books endpoints with the full AppModule.

## Key Test Cases

- **Contacts**: `listContacts`, `getContact`, `createContact`, `updateContact`, `deleteContact`
- **Invoices**: `listInvoices`, `getInvoice`, `createInvoice`, `updateInvoice`, `deleteInvoice`, `sendInvoice`, `markInvoiceAsSent`, `voidInvoice`
- **Bills**: `listBills`, `getBill`, `createBill`, `updateBill`, `deleteBill`
- **Expenses**: `listExpenses`, `getExpense`, `createExpense`, `updateExpense`, `deleteExpense`
- **Payments**: `listPayments`, `getPayment`, `createPayment`, `deletePayment`
- **Items**: `listItems`, `getItem`, `createItem`, `updateItem`, `deleteItem`

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration or mock data.
- Module fixture is closed in `afterAll`.
