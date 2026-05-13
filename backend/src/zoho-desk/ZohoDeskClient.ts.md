# ZohoDeskClient.ts

HTTP client for the Zoho Desk v1 REST API, extending `ZohoBaseClient` to provide typed methods for tickets, comments, contacts, agents, and departments.

## Key Exports

- **ZohoDeskConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoDeskClient** — API client class with methods for all Desk v1 endpoints

## Dependencies

- `ZohoBaseClient` — Base HTTP client with OAuth token management
- `ZohoCredentials` — Credential type definitions
- `zoho-desk.dto` — DTO interfaces (`DeskTicket`, `DeskComment`, `DeskContact`, `DeskAgent`, `DeskDepartment`, etc.)

## How It Works

The client extends `ZohoBaseClient`, defaulting the API base URL to `https://desk.zoho.com/api/v1`. It provides typed methods for tickets (list, get, create, update via PATCH, delete, search), comments (list, add, delete), contacts (list, get, create, update via PATCH, delete), agents (list, get), and departments (list, get). Update operations use the `patch` HTTP method following Desk API conventions.
