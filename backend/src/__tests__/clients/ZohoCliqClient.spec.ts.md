# ZohoCliqClient.spec.ts

Tests the `ZohoCliqClient` class which wraps the Zoho Cliq API v2, covering base URL, auth headers, and operations for channels, messages (channel, direct, and bot), user groups, and bots.

## Test Suites

- **ZohoCliqClient** — Single top-level suite with sections for Channels, Messages, User Groups, and Bots.

## Key Test Cases

- `uses the correct base URL` — Verifies `cliq.zoho.com/api/v2`.
- `injects auth header` — Confirms Zoho-oauthtoken format.
- `listChannels/getChannel/createChannel/deleteChannel/addChannelMember` — Channel CRUD and membership.
- `listChannelMessages/sendChannelMessage/sendDirectMessage/deleteMessage` — Messaging operations.
- `listUserGroups/createUserGroup` — User group management.
- `listBots/sendBotMessage` — Bot listing and bot-initiated messaging.

## Test Setup

- Uses `axios-mock-adapter` on the client's axios instance.
- `PassthroughAuth` provides a static test token.
- `beforeEach` creates a fresh client and mock; `afterEach` restores the mock.
