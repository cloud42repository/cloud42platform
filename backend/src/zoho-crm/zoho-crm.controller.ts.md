# zoho-crm.controller.ts

NestJS REST controller that exposes Zoho CRM API endpoints for managing leads, contacts, accounts, deals, tasks, notes, and generic module records, plus OAuth lifecycle.

## Key Exports

- **ZohoCrmController** — Controller class mapped to the `zoho-crm` route prefix, providing full CRUD and search for standard CRM modules as well as a generic module endpoint.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `ZohoCrmService` — Service layer handling Zoho CRM API operations

## How It Works

The controller defines route handlers grouped by CRM module: Leads, Contacts, Accounts, Deals, Tasks, and Notes each have list, get, create, update, and delete endpoints. A generic `modules/:module` set of routes allows CRUD on any CRM module by name. Search endpoints are provided for leads, contacts, and generic modules. Create/update endpoints accept `{ data: [] }` body payloads for bulk operations. OAuth endpoints handle authorization URL generation, code exchange, and token revocation.
