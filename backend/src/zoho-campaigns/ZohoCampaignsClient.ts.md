# ZohoCampaignsClient.ts

HTTP client class for the Zoho Campaigns v1.1 API, extending `ZohoBaseClient` with methods for mailing lists, subscribers, topics, and campaign management.

## Key Exports

- **ZohoCampaignsConfig** — Configuration interface extending ZohoCredentials with optional organizationId and apiBaseUrl
- **ZohoCampaignsClient** — API client class for Zoho Campaigns operations

## Dependencies

- `ZohoBaseClient` from `../base/ZohoBaseClient` — Base HTTP client with auth token management
- `ZohoCredentials` from `../base/types` — Base credential types
- DTO types from `./zoho-campaigns.dto` — Request/response type definitions

## How It Works

1. Constructor accepts `ZohoCampaignsConfig` and defaults the API base URL to `https://campaigns.zoho.com/api/v1.1`.
2. **Mailing Lists** — Uses legacy-style endpoints (`/getmailinglists`, `/addList`, `/deleteList`) with `resfmt: "JSON"` parameter.
3. **Subscribers** — List/add/remove via `/list/listsubscribers`, `/json/listsubscribe`, `/json/listunsubscribe`; subscriber data is sent as JSON-encoded `contactinfo`.
4. **Topics** — Lists topics via `/topicList`.
5. **Campaigns** — List all mailings, get details, send, and schedule using campaign key-based endpoints.
