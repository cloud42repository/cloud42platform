# ImpossibleCloudClient.spec.ts

Tests the `ImpossibleCloudClient` class which wraps the Impossible Cloud partner/distributor API, covering configuration, Bearer token authentication, error handling with `ImpossibleCloudApiError`, and all CRUD operations for regions, contracts, partners, members, storage accounts, and usage reporting.

## Test Suites

- **ImpossibleCloudClient** — Single top-level suite with sections for Configuration, Authentication, Error handling, Integrations, Distributors (Contracts, Partners, Members, Storage Accounts, Usage), and Partners (self-service Storage Accounts).

## Key Test Cases

- `uses the default base URL` / `uses a custom base URL when provided` — Configuration validation.
- `injects Bearer token in Authorization header` — Auth header format check.
- `updateApiKey() changes the token used in subsequent requests` — Runtime key rotation.
- `wraps HTTP errors in ImpossibleCloudApiError` — Error class instantiation.
- `ImpossibleCloudApiError carries the HTTP status code` — Error metadata.
- `listContracts/listContractPartners/createPartner/getPartner/updatePartner/deletePartner` — Distributor contract and partner CRUD.
- `createMember/deleteMember/listMembers` — Partner member management.
- `listPartnerStorageAccounts/createPartnerStorageAccount/get/delete/patch` — Partner-scoped storage.
- `getPartnerStorageAccountUsage/getPartnerUsage` — Usage reporting with date params.
- `createStorageAccount/listStorageAccounts/get/delete/patch/getStorageAccountUsage` — Self-service storage account operations.

## Test Setup

- Uses `axios-mock-adapter` on the client's internal axios instance.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
- `makeClient()` helper constructs the client with a test API key and optional base URL override.
