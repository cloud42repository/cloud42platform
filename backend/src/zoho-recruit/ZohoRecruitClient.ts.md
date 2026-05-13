# ZohoRecruitClient.ts

HTTP client class for the Zoho Recruit v2 API, extending the shared `ZohoBaseClient` with typed methods for job openings, candidates, interviews, and offers. Supports bulk create/update operations.

## Key Exports

- **ZohoRecruitConfig** — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- **ZohoRecruitClient** — Client class with methods for all Zoho Recruit API endpoints

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with authentication
- `ZohoCredentials` from `../base/types` — Base credential types
- DTO types from `./zoho-recruit.dto` — `RecruitJobOpening`, `RecruitCandidate`, `RecruitInterview`, `RecruitOffer`, etc.
- `ZohoListWrapper`, `ZohoBulkResponse` from `../shared/shared.dto` — Shared response wrapper types

## How It Works

1. **Constructor** — Accepts a `ZohoRecruitConfig`, defaulting the API base URL to `https://recruit.zoho.com/recruit/v2`.
2. **Job Openings** — `listJobOpenings`, `getJobOpening`, `createJobOpenings`, `updateJobOpenings`, `deleteJobOpening` map to `/JobOpenings`. Create/update accept arrays for bulk operations.
3. **Candidates** — `listCandidates`, `getCandidate`, `createCandidates`, `updateCandidates`, `deleteCandidate`, `searchCandidates` map to `/Candidates`. Includes a dedicated search endpoint.
4. **Interviews** — `listInterviews`, `getInterview`, `createInterviews`, `deleteInterview` map to `/Interviews`.
5. **Offers** — Read-only `listOffers`, `getOffer` map to `/Offers`.

All list methods return `ZohoListWrapper<T>` for paginated results, and mutation methods return `ZohoBulkResponse` for status tracking of bulk operations.
