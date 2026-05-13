# ZohoCommerceClient.ts

HTTP client for the Zoho Commerce v1 REST API, extending `ZohoBaseClient` to provide typed methods for products, categories, customers, and orders.

## Key Exports

- **ZohoCommerceConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoCommerceClient** — API client class with full CRUD methods for Commerce resources

## Dependencies

- `ZohoBaseClient` — Base HTTP client with OAuth token management
- `ZohoCredentials` — Credential type definitions
- `zoho-commerce.dto` — DTO interfaces (`CommerceProduct`, `CommerceCategory`, `CommerceCustomer`, `CommerceOrder`, etc.)

## How It Works

The client extends `ZohoBaseClient`, defaulting the API base URL to `https://commerce.zoho.com/store/api/v1`. It provides typed methods for products (list, get, create, update, delete), categories (list, get, create, delete), customers (list, get), and orders (list, get, create, update status, cancel). Each method calls the inherited HTTP helpers with properly typed request/response generics.
