# shared.dto.ts

Defines shared Zoho API response wrapper interfaces and primitive value types used across all Zoho product modules. Provides a consistent typing layer for paginated lists, single-record responses, bulk operations, and common field structures.

## Key Exports

- **`ZohoPageInfo`** — Interface for pagination metadata (`per_page`, `count`, `page`, `more_records`).
- **`ZohoListWrapper<T>`** — Generic interface wrapping paginated list responses (`data: T[]`, optional `info`).
- **`ZohoSingleWrapper<T>`** — Generic interface for single-record responses (Zoho still returns an array).
- **`ZohoBulkResult`** — Interface for individual bulk operation results (`code`, `details`, `message`, `status`).
- **`ZohoBulkResponse`** — Interface wrapping an array of `ZohoBulkResult`.
- **`ZohoLookup`** — Interface for lookup/reference fields (`id`, optional `name`).
- **`ZohoAddress`** — Interface for address fields (street, city, state, zip, country).
- **`ZohoTax`** — Interface for tax entries (`tax_name`, `tax_percentage`).
- **`ZohoListParams`** — Interface for common query parameters (`page`, `per_page`, `sort_by`, `sort_order`).

## Dependencies

- None (pure TypeScript interfaces).

## How It Works

These types are imported by individual module DTOs (e.g. `zoho-crm`, `zoho-books`) to type their API responses consistently. `ZohoListWrapper` and `ZohoSingleWrapper` model Zoho's standard response envelope pattern, while the primitive types (`ZohoLookup`, `ZohoAddress`, `ZohoTax`) represent commonly nested field structures.
