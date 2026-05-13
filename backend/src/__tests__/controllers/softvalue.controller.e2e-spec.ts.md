# softvalue.controller.e2e-spec.ts

End-to-end tests for the `SoftvalueController`, testing the HTTP proxy methods (GET, POST, PUT, PATCH, DELETE) and token management endpoints for the Softvalue integration.

## Test Suites

- **SoftvalueController (e2e)** — Tests Softvalue proxy and token endpoints with the full AppModule.

## Key Test Cases

- `GET /softvalue/proxy → proxyGet()` — Proxies a GET request to the Softvalue API.
- `POST /softvalue/proxy → proxyPost()` — Proxies a POST request.
- `PUT /softvalue/proxy → proxyPut()` — Proxies a PUT request.
- `PATCH /softvalue/proxy → proxyPatch()` — Proxies a PATCH request.
- `DELETE /softvalue/proxy → proxyDelete()` — Proxies a DELETE request.
- `POST /softvalue/token → updateToken()` — Updates the stored Softvalue API token.
- `GET /softvalue/token → getToken()` — Retrieves the current token.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration.
- Module fixture is closed in `afterAll`.
