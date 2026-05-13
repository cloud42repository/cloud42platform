# api-tester.component.ts

This component provides a Postman-like API testing interface within the Cloud42 Platform. Users can select a module and endpoint, configure path/query parameters, headers, and request body, then send HTTP requests and view formatted responses. It maintains a request history for quick replay.

## Key Exports

- **`ApiTesterComponent`** — Standalone Angular component for interactive API testing (selector: `app-api-tester`)
- **`HistoryEntry`** — Interface for stored request history (method, url, status, duration, response)

## Template

The template uses a three-panel layout:
- **Left panel (History)** — Scrollable list of past requests with method badges, URLs, status codes, and timing
- **Center panel (Request Builder)** — URL bar with method select, module select, endpoint select, and send button; resolved URL preview; tabbed config area (Path Params, Query Params, Body with autocomplete, Headers)
- **Response section** — Status code, duration, copy button, and formatted JSON output

## Dependencies

- `@angular/material` — Button, Icon, FormField, Input, Select, Tooltip, Divider, ProgressSpinner, Tabs, Chips
- `ApiService` — Executes HTTP requests through the backend proxy
- `MODULES` / `EndpointDef` — Module and endpoint configuration definitions
- `getEndpointPayload` — Default payload templates for endpoints
- `getEndpointInputSchema` — Input schema definitions for body autocomplete
- `TranslatePipe` — i18n translation

## How It Works

The user selects a module (which filters available endpoints), then an endpoint (which populates path parameters and sets the HTTP method). The resolved URL preview updates live as path params are filled. On send, the component constructs the full request (method, path params, query params, body, headers), calls `ApiService`, records timing, and stores the result in both the response display and the history list. The body editor includes an autocomplete overlay for known field names. History entries can be clicked to reload a previous request configuration.
