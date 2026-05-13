# zoho-mail.service.ts

Angular service providing an HTTP client for the Zoho Mail API. Manages mail accounts, folders, messages (including send, search, move, and read status), and contacts.

## Key Exports

- **ZohoMailService** — Injectable Angular service (root-provided) for Zoho Mail operations.

## Dependencies

- `@angular/core` — `Injectable`, `inject`
- `./api.service` — `ApiService`

## How It Works

The service uses `PREFIX = '/zoho-mail'` and provides methods grouped by resource:

1. **Accounts** — List and get mail accounts.
2. **Folders** — List folders for a mail account.
3. **Messages** — List messages in a folder, search messages, get a single message, send a new message, delete, move between folders, and mark as read.
4. **Contacts** — List, create, and delete contacts within an account.

All methods are scoped by `accountId`; message operations also require `folderId` or `messageId` as applicable.
