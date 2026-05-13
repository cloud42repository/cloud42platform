# impossible-cloud.dto.ts

TypeScript interface definitions (DTOs) for the Impossible Cloud Management Console API (v1.0). Covers regions, contracts, partners, members, storage accounts, and usage reporting.

## Key Exports

- **`ICRegion` / `ICListRegionsResponse`** — Region with S3/IAM/STS endpoint URLs
- **`ICContract`** — Distributor contract with capacity and cost fields
- **`ICPartner`** — Channel-partner belonging to a contract
- **`ICCreatePartnerDTO` / `ICUpdatePartnerDTO`** — Partner create/update request bodies
- **`ICMember`** — Management Console user (admin/staff/viewer)
- **`ICCreateMemberDTO`** — Member creation request body
- **`ICStorageAccount`** — S3 storage account metadata
- **`ICStorageAccountClientAccount`** — Embedded credentials for account creation
- **`ICCreateStorageAccountDTO` / `ICPatchStorageAccountDTO`** — Storage account create/patch bodies
- **`ICDailyUsage` / `ICClientUsage`** — Usage reporting data points
- **`ICUsageParams`** — Query parameters for usage endpoints (from/to dates)

## Dependencies

None (pure type definitions).

## How It Works

Interfaces map directly to the Impossible Cloud Swagger/OAS 2.0 specification. Request DTOs define required and optional fields for POST/PUT/PATCH operations; response interfaces describe the API's return shapes. Used throughout the impossible-cloud module for compile-time type safety.
