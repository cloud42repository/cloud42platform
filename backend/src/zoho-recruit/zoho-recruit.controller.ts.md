# zoho-recruit.controller.ts

NestJS REST controller that exposes Zoho Recruit operations as HTTP endpoints under the `/zoho-recruit` route prefix. It handles job openings, candidates, interviews, offers, and OAuth lifecycle.

## Key Exports

- **ZohoRecruitController** — Controller class with REST endpoints for Zoho Recruit ATS operations and OAuth flows.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Delete, Param, Body, Query decorators
- `ZohoRecruitService` — Service layer handling Zoho Recruit API interactions

## How It Works

The controller defines route handlers organized by resource:
1. **Job Openings** — CRUD operations (`GET/POST/PUT/DELETE /job-openings`), supports bulk create/update via `{ data: [...] }` body
2. **Candidates** — CRUD plus search (`GET/POST/PUT/DELETE /candidates`, `GET /candidates/search`)
3. **Interviews** — List, get, create, delete (`GET/POST/DELETE /interviews`)
4. **Offers** — Read-only list and get (`GET /offers`)
5. **OAuth** — Authorize URL, exchange grant code, and revoke endpoints

Each handler delegates to the corresponding service method.
