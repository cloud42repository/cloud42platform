# softvalue.controller.ts

NestJS REST controller that acts as a generic HTTP proxy to the Softvalue API under the `/softvalue` route prefix. Also provides endpoints for managing the Bearer token at runtime.

## Key Exports

- **`SoftvalueController`** — Controller with proxy routes (GET, POST, PUT, PATCH, DELETE) and token management endpoints.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Put, Patch, Delete, Query, Body, HttpCode decorators
- `./softvalue.service` — SoftvalueService

## How It Works

The controller exposes a transparent proxy pattern:
- `GET /softvalue/proxy?path=<apiPath>` — proxies GET requests to the Softvalue API
- `POST /softvalue/proxy?path=<apiPath>` — proxies POST with request body
- `PUT /softvalue/proxy?path=<apiPath>` — proxies PUT with request body
- `PATCH /softvalue/proxy?path=<apiPath>` — proxies PATCH with request body
- `DELETE /softvalue/proxy?path=<apiPath>` — proxies DELETE requests

Token management:
- `POST /softvalue/token` — updates the Bearer token (returns 204)
- `GET /softvalue/token` — retrieves the current token
