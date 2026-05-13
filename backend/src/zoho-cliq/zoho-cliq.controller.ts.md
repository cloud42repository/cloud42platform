# zoho-cliq.controller.ts

NestJS REST controller that exposes Zoho Cliq API endpoints for managing channels, messages, user groups, bots, and OAuth lifecycle. It delegates all business logic to `ZohoCliqService`.

## Key Exports

- **ZohoCliqController** — Controller class mapped to the `zoho-cliq` route prefix, providing CRUD endpoints for channels, messaging, user groups, bots, and OAuth token management.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `ZohoCliqService` — Service layer handling Zoho Cliq API operations

## How It Works

The controller defines route handlers for channels (list, get, create, delete, add/remove members), messages (list, send to channel, send direct, delete), user groups (list, get, create), bots (list, send message), and OAuth (authorize URL, exchange grant code, revoke). Each handler simply passes parameters to the corresponding `ZohoCliqService` method and returns the result.
