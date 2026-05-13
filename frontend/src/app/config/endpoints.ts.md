# endpoints.ts

This file defines the complete API endpoint registry for the platform, declaring all available modules and their endpoints with HTTP methods, path templates, and metadata. It serves as the single source of truth for API surface discovery across the API tester, dashboard, form, and workflow builders.

## Key Exports

- `EndpointDef` — Interface describing a single API endpoint (id, label, method, path template, flags for query params and body)
- `ModuleDef` — Interface describing a module (id, label, apiPrefix, icon, list of endpoints)
- `extractPathParams(template: string): string[]` — Utility function that extracts path parameter names from a path template string (e.g. `:contractId`)
- `MODULES: ModuleDef[]` — The master array of all module definitions with their endpoints
- `MODULE_MAP: Map<string, ModuleDef>` — A lookup map from module ID to its definition for O(1) access

## Dependencies

- None (self-contained, no external imports)

## How It Works

The file declares two interfaces (`EndpointDef` and `ModuleDef`) that structure the API catalog. The `MODULES` constant is a large array containing module definitions for 22+ services including Impossible Cloud, Softvalue, Zoho suite (Analytics, Books, CRM, Desk, etc.), ChatGPT, and Microsoft Graph. Each module entry specifies its API prefix, a Material icon name, and a list of endpoint definitions with HTTP methods and parameterized path templates. The `extractPathParams` helper uses a regex to pull `:param` names from templates. Finally, `MODULE_MAP` provides indexed access by module ID.
