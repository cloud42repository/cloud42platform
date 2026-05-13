# zoho-campaigns.controller.e2e-spec.ts

End-to-end tests for the `ZohoCampaignsController`, covering mailing list management, subscriber operations, topic listing, and campaign sending/scheduling for the Zoho Campaigns integration.

## Test Suites

- **ZohoCampaignsController (e2e)** — Tests all Zoho Campaigns endpoints with the full AppModule.

## Key Test Cases

- **Mailing Lists**: `listMailingLists`, `getMailingList`, `createMailingList`, `deleteMailingList`
- **Subscribers**: `listSubscribers`, `addSubscriber`, `removeSubscriber`
- **Topics**: `listTopics`
- **Campaigns**: `listCampaigns`, `getCampaign`, `sendCampaign`, `scheduleCampaign`

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration or mock data.
- Module fixture is closed in `afterAll`.
