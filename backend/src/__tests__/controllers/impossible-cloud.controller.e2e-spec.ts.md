# impossible-cloud.controller.e2e-spec.ts

End-to-end tests for the `ImpossibleCloudController`, exercising the Impossible Cloud platform API proxy including regions, contracts, partners, members, and storage account management.

## Test Suites

- **ImpossibleCloudController (e2e)** — Tests all Impossible Cloud endpoints with the full AppModule.

## Key Test Cases

- `GET /impossible-cloud/regions → listRegions()` — Lists available cloud regions.
- `GET /impossible-cloud/contracts → listContracts()` — Lists contracts.
- `GET /impossible-cloud/contracts/:contractId/partners → listContractPartners()` — Lists partners for a contract.
- `POST /impossible-cloud/partners → createPartner()` — Creates a partner.
- `GET /impossible-cloud/partners/:partnerId → getPartner()` — Retrieves a partner.
- `PUT /impossible-cloud/partners/:partnerId → updatePartner()` — Updates a partner.
- `DELETE /impossible-cloud/partners/:partnerId → deletePartner()` — Deletes a partner.
- `GET /impossible-cloud/partners/:partnerId/members → listMembers()` — Lists partner members.
- `POST /impossible-cloud/partners/:partnerId/members → createMember()` — Adds a member to a partner.
- `DELETE /impossible-cloud/partners/:partnerId/members/:memberId → deleteMember()` — Removes a member.
- `GET/POST/DELETE/PATCH .../storage-accounts` — Full CRUD for partner and standalone storage accounts.
- `GET .../usage` — Retrieves usage metrics for storage accounts and partners.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration or mock data.
- Module fixture is closed in `afterAll`.
