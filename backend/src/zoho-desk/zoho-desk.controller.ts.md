# zoho-desk.controller.ts

NestJS REST controller that exposes Zoho Desk API endpoints for managing tickets, comments, contacts, agents, departments, and OAuth lifecycle.

## Key Exports

- **ZohoDeskController** — Controller class mapped to the `zoho-desk` route prefix, providing CRUD for tickets and contacts, comment management, read-only access to agents and departments, and OAuth.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Patch, Param, Body, Query decorators
- `ZohoDeskService` — Service layer handling Zoho Desk API operations

## How It Works

The controller defines route handlers for tickets (list, search, get, create, update via PATCH, delete), ticket comments (list, add, delete), contacts (list, get, create, update, delete), agents (list, get), departments (list, get), and OAuth (authorize, exchange, revoke). Each handler delegates to `ZohoDeskService` and returns the result directly.
