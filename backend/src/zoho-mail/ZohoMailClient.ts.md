# ZohoMailClient.ts

HTTP client class for the Zoho Mail API, extending the shared `ZohoBaseClient` to provide typed methods for accounts, folders, messages (including send, delete, move, mark-read, and search), and contacts.

## Key Exports

- `ZohoMailConfig` — Configuration interface extending `ZohoCredentials` with optional `organizationId` and `apiBaseUrl`
- `ZohoMailClient` — Client class with methods for all Zoho Mail API endpoints

## Dependencies

- `../base/ZohoBaseClient` — Base HTTP client with get/post/put/delete methods and token management
- `../base/types` — `ZohoCredentials` interface
- `./zoho-mail.dto` — All DTO/interface types for request/response data

## How It Works

The constructor configures the base URL (defaulting to `https://mail.zoho.com/api`). All endpoints are scoped by `accountId`. Methods include: `listAccounts`/`getAccount` for accounts, `listFolders` for folders, `listMessages`/`getMessage`/`sendMessage`/`deleteMessage` for basic message operations, `moveMessage`/`markRead` via the `updatemessage` endpoint with mode flags, `searchMessages` with a search key parameter, and `listContacts`/`createContact`/`deleteContact` for contact management. All methods return typed Promises.
