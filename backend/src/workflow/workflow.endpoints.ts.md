# workflow.endpoints.ts

Registry of all available API modules and their endpoints, used by the workflow execution engine to build API calls and generate script proxy objects.

## Key Exports

- **EndpointDef** — interface describing a single endpoint (id, label, method, pathTemplate, hasQueryParams, hasBody)
- **ModuleDef** — interface describing a module with its id, label, apiPrefix, and array of endpoints
- **extractPathParams(template)** — utility function that extracts path parameter names from a path template (e.g. `/contracts/:contractId` → `['contractId']`)
- **MODULES** — the full array of `ModuleDef` objects covering all integrated APIs (Impossible Cloud, Softvalue, Zoho Analytics, Zoho Books, Zoho Campaigns, Zoho Cliq, Zoho Commerce, Zoho Creator, etc.)

## Dependencies

None (self-contained constants and interfaces).

## How It Works

The file defines a static registry (`MODULES`) that enumerates every API module the platform integrates with. Each module specifies an `apiPrefix` (used for routing) and a list of endpoints with HTTP method, path template, and flags for query params and body support. The execution engine uses this registry to:
1. Resolve path parameters for endpoint steps via `extractPathParams`.
2. Build API proxy objects for script blocks (mapping module/endpoint IDs to callable functions).
3. Construct the correct URL when proxying requests through the backend.
