# microsoft-graph.dto.ts

TypeScript interface definitions for Microsoft Graph email operations. Defines the request shape for sending emails and the response confirmation.

## Key Exports

- **`SendMailRequest`** — Request body with to, subject, body, contentType (text/html), cc, bcc, attachments, and saveToSentItems flag.
- **`MailAttachment`** — File attachment with name, contentType, and base64-encoded contentBytes.
- **`SendMailResponse`** — Success confirmation with a boolean flag and message string.

## Dependencies

None (pure type definitions).

## How It Works

`SendMailRequest` accepts single or array email addresses for to/cc/bcc, supports text or HTML body content, and optional file attachments encoded as base64. The service uses these interfaces to construct the Microsoft Graph `/me/sendMail` API payload.
