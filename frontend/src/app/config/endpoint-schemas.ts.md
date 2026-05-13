# endpoint-schemas.ts

This file provides input (request) and output (response) JSON schema samples for every API endpoint in the platform. It powers intellisense, autocompletion in body textareas, and step-reference suggestions across the API tester, dashboard, form, and workflow builders.

## Key Exports

- `EndpointIOSchema` — Interface with optional `input`, `output`, and `outputLabel` fields describing the shape of request/response payloads
- `getEndpointSchema(moduleId, endpointId): EndpointIOSchema | null` — Returns a deep-cloned full I/O schema for a given module and endpoint
- `getEndpointOutputSchema(moduleId, endpointId): Record<string, unknown> | unknown[] | null` — Returns only the output (response) schema, useful for workflow step-reference intellisense
- `getEndpointInputSchema(moduleId, endpointId): Record<string, unknown> | null` — Returns only the input (request body) schema for body textarea intellisense

## Dependencies

- None (self-contained, schemas derived from Impossible Cloud Partner API swagger spec, Zoho, and OpenAI public API documentation)

## How It Works

The file defines per-module schema dictionaries (e.g. `IC_SCHEMAS`, `CRM_SCHEMAS`, `BOOKS_SCHEMAS`) where each key is an endpoint ID and the value is an `EndpointIOSchema` object with sample JSON for both request input and response output shapes. These per-module dictionaries are aggregated into a single `SCHEMA_MAP` keyed by module ID. The exported getter functions look up schemas from this map and return deep clones via `structuredClone()` so consumers can safely mutate the results without affecting the canonical data.
