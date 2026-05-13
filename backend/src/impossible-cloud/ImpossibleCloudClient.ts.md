# ImpossibleCloudClient.ts

Axios-based HTTP client for the Impossible Cloud Management Console API. Authenticates with a Bearer token, wraps errors in a typed `ImpossibleCloudApiError`, and supports mock mode for testing.

## Key Exports

- **`ImpossibleCloudConfig`** — Configuration interface (apiKey, baseUrl, timeout)
- **`ImpossibleCloudApiError`** — Custom error class with status code and response data
- **`ImpossibleCloudClient`** — Main client class with typed methods for all Management Console endpoints

## Dependencies

- `axios` — HTTP client (AxiosInstance, AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig)
- `../mock/mock-adapter` — attachMockAdapter (for MOCK_MODE)
- `./impossible-cloud.dto` — All DTO type imports

## How It Works

1. Constructor creates an Axios instance with base URL (default: `https://api.partner.impossiblecloud.com/v1`) and timeout (default: 30s).
2. Request interceptor injects `Authorization: Bearer <apiKey>` on every request.
3. Response interceptor catches HTTP errors and throws `ImpossibleCloudApiError`.
4. If `MOCK_MODE=true`, attaches a mock adapter.
5. Provides typed methods organized by API tag:
   - **Integrations**: `listRegions()`
   - **Distributors → Contracts**: `listContracts()`, `listContractPartners()`
   - **Distributors → Partners**: `createPartner()`, `getPartner()`, `updatePartner()`, `deletePartner()`
   - **Distributors → Members**: `createMember()`, `deleteMember()`, `listMembers()`
   - **Distributors → Storage Accounts**: CRUD for partner-scoped storage accounts
   - **Distributors → Usage**: `getPartnerStorageAccountUsage()`, `getPartnerUsage()`
   - **Partners → Storage Accounts**: self-service CRUD and usage
6. Exposes generic `get`, `post`, `put`, `patch`, `delete` helpers and `updateApiKey()`.
