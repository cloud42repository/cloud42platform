# endpoint-payloads.ts

This file provides default payload templates for all API endpoints that accept a request body. These templates contain sensible defaults and example values, ready to be used as starting points when users construct API requests in the platform's builders.

## Key Exports

- `getEndpointPayload(moduleId: string, endpointId: string): unknown` — Returns a deep-cloned default payload template for a given module and endpoint, or `null` if no template exists

## Dependencies

- None (self-contained, all payload data is statically defined)

## How It Works

The file defines per-module payload dictionaries (e.g. `IC_PAYLOADS`, `CRM_PAYLOADS`, `BOOKS_PAYLOADS`) where each key is an endpoint ID and the value is a ready-to-use JSON object with placeholder fields. These dictionaries cover all modules that have POST/PUT/PATCH endpoints: Impossible Cloud, Softvalue, Zoho suite (Analytics, Books, Campaigns, Cliq, Commerce, Creator, CRM, Desk, Expense, Inventory, Invoice, Mail, Payroll, People, Projects, Recruit, SalesIQ, Sign, Subscriptions, WorkDrive), and ChatGPT. All per-module maps are aggregated into a single `PAYLOAD_MAP`. The exported `getEndpointPayload` function looks up the template and returns a `structuredClone()` so consumers can mutate freely.
