# zoho-cliq.controller.e2e-spec.ts

End-to-end tests for the `ZohoCliqController`, covering channel management, messaging (channel and direct), user groups, and bot interactions for the Zoho Cliq integration.

## Test Suites

- **ZohoCliqController (e2e)** — Tests all Zoho Cliq endpoints with the full AppModule.

## Key Test Cases

- **Channels**: `listChannels`, `getChannel`, `createChannel`, `deleteChannel`, `addChannelMember`, `removeChannelMember`
- **Channel Messages**: `listChannelMessages`, `sendChannelMessage`, `deleteMessage`
- **Direct Messages**: `sendDirectMessage`
- **User Groups**: `listUserGroups`, `getUserGroup`, `createUserGroup`
- **Bots**: `listBots`, `sendBotMessage`

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No external mocks; relies on service-level integration or mock data.
- Module fixture is closed in `afterAll`.
