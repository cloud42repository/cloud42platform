# zoho-sign.controller.ts

NestJS REST controller exposing Zoho Sign API endpoints for managing signature requests, templates, and documents.

## Key Exports

- **ZohoSignController** — Controller class registered at route `zoho-sign`, delegating all operations to `ZohoSignService`.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `ZohoSignService` — Business logic layer for Sign operations

## How It Works

The controller defines RESTful endpoints grouped by resource:
1. **Requests** — CRUD operations plus send, recall, and remind actions on signature requests.
2. **Templates** — List, get, and create requests from templates.
3. **Documents** — Get document metadata and download signed PDFs.
4. **OAuth** — Authorize, exchange grant code, and revoke authentication.

Each method delegates directly to the corresponding service method.
