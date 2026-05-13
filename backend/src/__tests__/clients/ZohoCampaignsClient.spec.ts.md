# ZohoCampaignsClient.spec.ts

Tests the `ZohoCampaignsClient` class which wraps the Zoho Campaigns API v1.1, covering base URL configuration, auth headers, and operations for mailing lists, subscribers, topics, and campaigns (including send and schedule).

## Test Suites

- **ZohoCampaignsClient** — Single top-level suite with sections for Mailing Lists, Subscribers, Topics, and Campaigns.

## Key Test Cases

- `uses the correct base URL` — Verifies `campaigns.zoho.com/api/v1.1`.
- `injects auth header` — Confirms Zoho-oauthtoken format.
- `listMailingLists/createMailingList/deleteMailingList` — Mailing list management.
- `listSubscribers/addSubscriber/removeSubscriber` — Subscriber operations with list keys.
- `listTopics()` — Topic retrieval.
- `listCampaigns/getCampaign/sendCampaign/scheduleCampaign` — Campaign lifecycle with keys and scheduling.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
