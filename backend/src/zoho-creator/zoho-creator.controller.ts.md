# zoho-creator.controller.ts

NestJS REST controller that exposes Zoho Creator API endpoints for managing applications, forms, records, reports, workflows, and OAuth lifecycle.

## Key Exports

- **ZohoCreatorController** — Controller class mapped to the `zoho-creator` route prefix, providing endpoints for application management, form/record CRUD, report listing, workflow triggering, and OAuth.

## Dependencies

- `@nestjs/common` — Body, Controller, Delete, Get, Param, Post, Put, Query decorators
- `ZohoCreatorService` — Service layer handling Zoho Creator API operations

## How It Works

The controller defines nested route handlers using application and form/report link names as path parameters. Endpoints cover: applications (list, get), forms (list, get), records (list, get, create, update, delete, search via reports), reports (list), workflows (trigger), and OAuth (authorize, exchange, revoke). Each handler delegates to `ZohoCreatorService`.
