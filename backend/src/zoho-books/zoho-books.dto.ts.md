# zoho-books.dto.ts

TypeScript interfaces and types defining data structures for the Zoho Books module. Covers contacts, line items, invoices, bills, expenses, payments, items (product/service catalogue), and recurring invoices.

## Key Exports

- **BooksContact** / **CreateBooksContactDTO** / **UpdateBooksContactDTO** — Contact entity and DTOs
- **BooksLineItem** — Line item structure used in invoices and bills
- **InvoiceStatus** — Status union type for invoices
- **BooksInvoice** / **CreateBooksInvoiceDTO** / **UpdateBooksInvoiceDTO** — Invoice entity and DTOs
- **BillStatus** — Status union type for bills
- **BooksBill** / **CreateBillDTO** / **UpdateBillDTO** — Bill entity and DTOs
- **BooksExpense** / **CreateBooksExpenseDTO** / **UpdateBooksExpenseDTO** — Expense entity and DTOs
- **BooksPayment** / **CreateBooksPaymentDTO** — Payment entity and create DTO
- **BooksItem** / **CreateBooksItemDTO** / **UpdateBooksItemDTO** — Item catalogue entity and DTOs
- **BooksRecurringInvoice** / **CreateRecurringInvoiceDTO** / **UpdateRecurringInvoiceDTO** — Recurring invoice entity and DTOs
- **RecurringInvoiceComment** — Comment on a recurring invoice
- **BooksListParams** — Extended list parameters for Zoho Books queries

## Dependencies

- `ZohoListWrapper`, `ZohoListParams`, `ZohoAddress`, `ZohoTax` from `../shared/shared.dto` — Shared base types

## How It Works

Provides pure TypeScript type definitions organized by resource type (contacts, invoices, bills, expenses, payments, items, recurring invoices). Each section defines the entity interface, a create DTO (typically omitting auto-generated fields), and an update DTO (typically a partial of the create DTO). Types like `InvoiceStatus` and `BillStatus` constrain status fields to known values.
