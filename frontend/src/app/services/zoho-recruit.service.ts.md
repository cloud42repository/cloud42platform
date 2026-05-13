# zoho-recruit.service.ts

Angular service providing an HTTP client for the Zoho Recruit hiring API. Manages job openings, candidates, interviews, and offers.

## Key Exports

- **ZohoRecruitService** — Injectable Angular service (root-provided) for Zoho Recruit operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-recruit'` and provides methods grouped by resource:

1. **Job Openings** — List, get, create (batch), update (batch), delete job openings.
2. **Candidates** — List, search, get, create (batch), update (batch), delete candidates.
3. **Interviews** — List, get, create (batch), delete interviews.
4. **Offers** — List and get offer records.

Batch create/update methods accept arrays wrapped in `{ data }` to match Zoho's bulk API format.
