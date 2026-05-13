# zoho-analytics.controller.ts

REST controller that exposes Zoho Analytics API operations as HTTP endpoints under the `/zoho-analytics` route prefix. It delegates all business logic to `ZohoAnalyticsService` and provides CRUD operations for workspaces, views, reports, dashboards, data import/export, and OAuth flow management.

## Key Exports

- **ZohoAnalyticsController** — NestJS controller handling all Zoho Analytics HTTP routes

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `ZohoAnalyticsService` — Service layer for Zoho Analytics operations

## How It Works

The controller defines route handlers organized by resource type:
1. **Workspaces** — list, get, create, delete workspaces
2. **Views** — list, get, create, delete views within a workspace
3. **Reports** — list reports for a workspace
4. **Dashboards** — list dashboards for a workspace
5. **Data Import/Export** — import data via POST body, export data in csv/json/xlsx format
6. **OAuth** — authorize, exchange grant code, and revoke authentication

Each handler simply passes parameters to the corresponding service method and returns the result.
