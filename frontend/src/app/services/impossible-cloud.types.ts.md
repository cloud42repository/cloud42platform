# impossible-cloud.types.ts

TypeScript type definitions for the Impossible Cloud Management Console API, mirroring the backend DTOs. Provides interfaces for regions, contracts, partners, members, storage accounts, and usage data.

## Key Exports

- **ICRegion** — Geographic region with S3/IAM/STS endpoint URLs.
- **ICListRegionsResponse** — Wrapper containing an array of `ICRegion`.
- **ICContract** — Distributor contract with capacity and cost details.
- **ICPartner** — Partner entity under a distributor contract.
- **ICCreatePartnerDTO** — Request body for creating a partner.
- **ICUpdatePartnerDTO** — Request body for updating a partner.
- **ICMember** — MC user member with role (admin/staff/viewer).
- **ICCreateMemberDTO** — Request body for creating a member.
- **ICStorageAccountClientAccount** — Credentials sub-object for storage account creation.
- **ICStorageAccount** — Storage account entity with capacity and deletion scheduling.
- **ICCreateStorageAccountDTO** — Request body for creating a storage account.
- **ICPatchStorageAccountDTO** — Request body for patching a storage account (deletion scheduling).
- **ICDailyUsage** — Single day's usage data point.
- **ICClientUsage** — Usage summary with daily breakdown for a client/account.
- **ICUsageParams** — Query parameters (from/to date range) for usage endpoints.

## Dependencies

None — this is a pure type definition file with no runtime imports.

## How It Works

The file declares TypeScript interfaces that model the Impossible Cloud API's request and response shapes. All properties are optional (except in DTO interfaces where required fields enforce payload correctness). The types are consumed by `ImpossibleCloudService` to provide compile-time safety for API interactions.
