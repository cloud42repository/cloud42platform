# ZohoMailClient.spec.ts

Tests the `ZohoMailClient` class, verifying correct base URL configuration, authentication header injection, and API operations for accounts, folders, messages (including search, move, and mark-read), and contacts against the Zoho Mail API.

## Test Suites

- **ZohoMailClient** — Main suite covering auth, URL validation, and all mail-related resource endpoints.

## Key Test Cases

- `uses the correct base URL` — Verifies base URL contains `mail.zoho.com/api`
- `injects auth header` — Confirms `Zoho-oauthtoken` header is set correctly
- `listAccounts()` / `getAccount()` — Account retrieval endpoints
- `listFolders()` — Folder listing per account
- `listMessages()` / `getMessage()` / `sendMessage()` / `deleteMessage()` — Full message lifecycle
- `searchMessages()` — Verifies searchKey parameter is passed correctly
- `moveMessage()` — Validates move mode and target folder in request body
- `markRead()` — Validates markAsRead mode and isRead flag
- `listContacts()` / `createContact()` / `deleteContact()` — Contact management endpoints

## Test Setup

- **beforeEach**: Creates a new `ZohoMailClient` instance with `PassthroughAuth` and initializes an `axios-mock-adapter`.
- **afterEach**: Restores the mock adapter.
- Uses a constant `ACCOUNT_ID` for account-scoped endpoint tests.
