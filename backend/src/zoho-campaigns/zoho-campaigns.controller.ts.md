# zoho-campaigns.controller.ts

REST controller exposing Zoho Campaigns API operations under the `/zoho-campaigns` route prefix. Handles mailing lists, subscribers, topics, campaigns, and OAuth endpoints.

## Key Exports

- **ZohoCampaignsController** — NestJS controller for all Zoho Campaigns HTTP routes

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Delete, Param, Body, Query decorators
- `ZohoCampaignsService` — Service layer for Zoho Campaigns operations

## How It Works

The controller groups endpoints by resource:
1. **Mailing Lists** — list, get, create, delete mailing lists
2. **Subscribers** — list, add, remove subscribers from a mailing list
3. **Topics** — list available campaign topics
4. **Campaigns** — list, get, send, schedule campaigns
5. **OAuth** — authorize, exchange grant code, revoke authentication

Each handler delegates to the corresponding `ZohoCampaignsService` method and returns the result.
