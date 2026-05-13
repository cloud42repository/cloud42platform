# zoho-commerce.dto.ts

TypeScript interfaces and types defining the data structures for the Zoho Commerce integration, covering products, variants, categories, customers, and orders.

## Key Exports

- **CommerceProductStatus** — Union type for product statuses (`active`, `inactive`, `draft`)
- **CommerceProduct** — Interface representing a Commerce product with variants, pricing, and stock
- **CreateCommerceProductDTO** — DTO for creating a product
- **UpdateCommerceProductDTO** — Partial DTO for updating a product
- **CommerceVariant** — Interface for product variant with SKU, price, and options
- **CommerceCategory** — Interface for a product category
- **CommerceCustomer** — Interface for a customer with billing/shipping addresses
- **OrderStatus** — Union type for order lifecycle statuses
- **CommerceOrderItem** — Interface for a line item in an order
- **CommerceOrder** — Interface for a full order with items, totals, and addresses
- **CreateOrderDTO** — DTO for placing an order
- **CommerceListParams** — Pagination/filter params extending `ZohoListParams`

## Dependencies

- `../shared/shared.dto` — `ZohoAddress`, `ZohoListParams`

## How It Works

Defines all request/response shapes used by `ZohoCommerceClient` and the service layer. Types are organized by domain entity (Product, Variant, Category, Customer, Order) with separate Create/Update DTOs following the partial-update pattern.
