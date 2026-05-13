# zoho-invoice.dto.ts

TypeScript interfaces and type definitions for Zoho Invoice API data structures, covering customers, invoices, estimates, recurring invoices, payments, and list query parameters.

## Key Exports

- `InvoiceCustomer` — Interface for customer objects
- `CreateInvoiceCustomerDTO` / `UpdateInvoiceCustomerDTO` — DTOs for creating/updating customers
- `InvoiceRecord` — Interface for invoice objects
- `CreateInvoiceRecordDTO` / `UpdateInvoiceRecordDTO` — DTOs for creating/updating invoices
- `EstimateStatus` — Union type for estimate statuses
- `InvoiceEstimate` — Interface for estimate objects
- `CreateInvoiceEstimateDTO` / `UpdateInvoiceEstimateDTO` — DTOs for creating/updating estimates
- `RecurringInvoice` — Interface for recurring invoice objects
- `CreateRecurringInvoiceDTO` — DTO for creating recurring invoices
- `InvoicePayment` — Interface for payment objects
- `CreateInvoicePaymentDTO` — DTO for creating payments
- `InvoiceListParams` — Query parameters for listing resources (extends ZohoListParams)

## Dependencies

- `../shared/shared.dto` — `ZohoAddress`, `ZohoTax`, `ZohoListParams` shared types
- `../zoho-books/zoho-books.dto` — `BooksLineItem`, `InvoiceStatus` reused types

## How It Works

Defines the shape of all request/response data for the Zoho Invoice module. Reuses `BooksLineItem` and `InvoiceStatus` from the Zoho Books module for line items and status fields. DTOs use required fields for creation and `Partial<>` wrappers for updates. `InvoiceListParams` adds customer_id, status, date range, and search_text filters.
