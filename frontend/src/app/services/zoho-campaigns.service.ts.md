# zoho-campaigns.service.ts

Angular service providing an HTTP client for the Zoho Campaigns email marketing API. Manages mailing lists, subscribers, topics, and campaign sending/scheduling.

## Key Exports

- **ZohoCampaignsService** — Injectable Angular service (root-provided) for Zoho Campaigns operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-campaigns'` and provides methods grouped by resource:

1. **Mailing Lists** — List, get, create, and delete mailing lists.
2. **Subscribers** — List subscribers in a list, add a subscriber, remove a subscriber.
3. **Topics** — List available topics.
4. **Campaigns** — List and get campaigns, send immediately, or schedule for later delivery.
