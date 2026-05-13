# ZohoRecruitClient.spec.ts

Tests the `ZohoRecruitClient` class, verifying correct base URL, auth header injection, and CRUD operations for job openings, candidates (including search), interviews, and offers against the Zoho Recruit v2 API.

## Test Suites

- **ZohoRecruitClient** — Main suite covering authentication, URL configuration, and all recruitment resource endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `recruit.zoho.com/recruit/v2`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is set
- `listJobOpenings()` / `getJobOpening()` / `createJobOpenings()` / `deleteJobOpening()` — Job opening CRUD with batch create support
- `listCandidates()` / `getCandidate()` / `createCandidates()` / `deleteCandidate()` — Candidate CRUD
- `searchCandidates()` — Candidate search with criteria parameter
- `listInterviews()` / `createInterviews()` — Interview scheduling
- `listOffers()` — Offer listing

## Test Setup

- **beforeEach**: Creates a new `ZohoRecruitClient` instance with `PassthroughAuth` and initializes `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
