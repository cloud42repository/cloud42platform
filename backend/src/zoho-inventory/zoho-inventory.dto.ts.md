# zoho-inventory.dto.ts

TypeScript interfaces and type definitions for Zoho Inventory API data structures, covering items, warehouses, sales orders, purchase orders, and list query parameters.

## Key Exports

- `InventoryItemType` — Union type for item types (sales, purchases, sales_and_purchases, inventory)
- `InventoryItem` — Interface for inventory item objects
- `CreateInventoryItemDTO` / `UpdateInventoryItemDTO` — DTOs for creating/updating items
- `Warehouse` — Interface for warehouse objects
- `SalesOrderStatus` — Union type for sales order statuses
- `SalesOrderLineItem` — Interface for line items within orders
- `SalesOrder` — Interface for sales order objects
- `CreateSalesOrderDTO` / `UpdateSalesOrderDTO` — DTOs for creating/updating sales orders
- `PurchaseOrderStatus` — Union type for purchase order statuses
- `PurchaseOrder` — Interface for purchase order objects
- `CreatePurchaseOrderDTO` / `UpdatePurchaseOrderDTO` — DTOs for creating/updating purchase orders
- `InventoryListParams` — Query parameters for listing resources (extends ZohoListParams)

## Dependencies

- `../shared/shared.dto` — `ZohoAddress`, `ZohoTax`, `ZohoListParams` shared types

## How It Works

Defines the shape of all request/response data for the Zoho Inventory module. Line items are shared between sales and purchase orders. DTOs use required fields for creation and `Partial<>` wrappers for updates. `InventoryListParams` adds status, search_text, and filter_by to the base list params.
