# impossible-cloud.controller.ts

NestJS REST controller exposing Impossible Cloud Management Console API endpoints under `/impossible-cloud`. Includes a custom exception filter that maps `ImpossibleCloudApiError` to appropriate HTTP responses.

## Key Exports

- **`ImpossibleCloudController`** — Controller with routes for regions, contracts, partners, members, storage accounts, and usage.
- **`IcApiExceptionFilter`** — Exception filter that catches `ImpossibleCloudApiError` and returns proper HTTP status codes.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, UseFilters, Catch, etc.
- `./impossible-cloud.service` — ImpossibleCloudService
- `./ImpossibleCloudClient` — ImpossibleCloudApiError
- `express` — Response type

## How It Works

The controller defines comprehensive CRUD routes organized by resource:
- **Regions**: `GET /regions` — list available regions
- **Contracts**: `GET /contracts`, `GET /contracts/:contractId/partners`
- **Partners**: `POST`, `GET`, `PUT`, `DELETE` on `/partners/:partnerId`
- **Members**: `GET`, `POST`, `DELETE` on `/partners/:partnerId/members`
- **Partner Storage Accounts**: full CRUD + usage under `/partners/:partnerId/storage-accounts`
- **Own Storage Accounts**: full CRUD + usage under `/storage-accounts`

All handlers delegate to the service. The `IcApiExceptionFilter` intercepts client errors and returns them as JSON with the original status code.
