# zoho-recruit.controller.e2e-spec.ts

This end-to-end test validates the `ZohoRecruitController` by loading the full `AppModule` and invoking controller methods directly to verify integration with the real service layer for job openings, candidates, interviews, and offers.

## Test Suites

- **ZohoRecruitController (e2e)** — Full integration test of all Zoho Recruit endpoints

## Key Test Cases

- `should be defined` — Controller instantiation check
- **Job Openings**: `listJobOpenings`, `getJobOpening`, `createJobOpenings`, `updateJobOpenings`, `deleteJobOpening`
- **Candidates**: `listCandidates`, `searchCandidates`, `getCandidate`, `createCandidates`, `updateCandidates`, `deleteCandidate`
- **Interviews**: `listInterviews`, `getInterview`, `createInterviews`, `deleteInterview`
- **Offers**: `listOffers`, `getOffer`

## Test Setup

- Imports the full `AppModule` to create a complete application context
- Uses `beforeAll`/`afterAll` for module lifecycle (compile and close)
- Controller methods are called directly with test data (dummy IDs, minimal payloads)
- All assertions verify that results are defined (non-null responses from the API)
