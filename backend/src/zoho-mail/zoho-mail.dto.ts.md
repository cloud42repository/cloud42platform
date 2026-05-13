# zoho-mail.dto.ts

TypeScript interfaces and type definitions for Zoho Mail API data structures, covering mail accounts, folders, messages, attachments, contacts, and list query parameters.

## Key Exports

- `MailAccount` — Interface for mail account/mailbox objects
- `SystemFolderType` — Union type for system folder names (Inbox, Sent, Drafts, Trash, Spam, Archive)
- `MailFolder` — Interface for mail folder objects
- `MessageStatus` — Union type for message read/unread status
- `MailMessage` — Interface for email message objects
- `SendMessageDTO` — DTO for composing and sending an email
- `MailAttachment` — Interface for attachment metadata
- `MailContact` — Interface for mail contact objects
- `CreateMailContactDTO` — DTO for creating a contact
- `MailListParams` — Query parameters for listing messages (extends ZohoListParams)

## Dependencies

- `../shared/shared.dto` — `ZohoListParams` base interface for pagination/filtering

## How It Works

Defines the shape of all request/response data for the Zoho Mail module. `SendMessageDTO` includes fields for addresses, subject, content, format, and attachments. `MailListParams` extends the shared base with folder, search, status, and sort options.
