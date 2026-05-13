# ZohoCliqClient.ts

HTTP client for the Zoho Cliq v2 REST API, extending `ZohoBaseClient` to provide typed methods for channels, messages, user groups, and bots.

## Key Exports

- **ZohoCliqConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoCliqClient** — API client class with methods for all Cliq v2 endpoints

## Dependencies

- `ZohoBaseClient` — Base HTTP client with OAuth token management
- `ZohoCredentials` — Credential type definitions
- `zoho-cliq.dto` — DTO interfaces (`CliqChannel`, `CliqMessage`, `CliqUserGroup`, `CliqBot`, etc.)

## How It Works

The client extends `ZohoBaseClient`, configuring the API base URL to `https://cliq.zoho.com/api/v2` by default. It provides typed methods organized by resource: channels (list, get, create, delete, add/remove members), messages (list channel messages, send to channel/direct, delete), user groups (list, get, create), and bots (list, send message). Each method calls inherited HTTP helpers (`get`, `post`, `delete`) with the appropriate path and parameters.
