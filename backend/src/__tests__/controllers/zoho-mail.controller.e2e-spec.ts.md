# zoho-mail.controller.e2e-spec.ts

End-to-end test for the `ZohoMailController` that boots the full `AppModule` and exercises Zoho Mail endpoints including Accounts, Folders, Messages (send, move, mark read), and Contacts.

## Test Suites

- **ZohoMailController (e2e)** — full integration tests against Zoho Mail endpoints

## Key Test Cases

- **Accounts** — `listAccounts()`, `getAccount()`
- **Folders** — `listFolders()`
- **Messages** — `listMessages()`, `searchMessages()`, `getMessage()`, `sendMessage()`, `deleteMessage()`, `moveMessage()`, `markRead()`
- **Contacts** — `listContacts()`, `createContact()`, `deleteContact()`

## Test Setup

- Imports the full `AppModule` via `Test.createTestingModule`
- Controller is retrieved from the compiled module in `beforeAll`
- Module is closed in `afterAll` for cleanup
- Tests call controller methods directly with sample account/message IDs and email data (toAddress, subject, content)
