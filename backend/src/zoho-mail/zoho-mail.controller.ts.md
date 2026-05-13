# zoho-mail.controller.ts

NestJS REST controller that exposes Zoho Mail API endpoints for managing mail accounts, folders, messages (send, delete, move, mark read, search), and contacts. It also provides OAuth endpoints for authorization, token exchange, and revocation.

## Key Exports

- `ZohoMailController` — Controller class handling all `/zoho-mail/*` routes, delegating to `ZohoMailService`

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `./zoho-mail.service` — `ZohoMailService` for business logic

## How It Works

The controller defines RESTful endpoints scoped by account ID: accounts (list/get), folders (list), messages (list/get/send/delete/move/markRead/search), contacts (list/create/delete), and OAuth (authorize/exchange/revoke). Each method extracts route params, query params, or body data and delegates directly to the service.
