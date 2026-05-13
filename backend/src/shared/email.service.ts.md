# email.service.ts

NestJS injectable service responsible for sending transactional emails via the Microsoft Graph API. Currently handles the account-approval password-set email sent to newly approved users.

## Key Exports

- **`EmailService`** — Injectable class providing email-sending methods.

## Dependencies

- `@nestjs/common` — `Injectable`, `Logger`.
- `@nestjs/config` — `ConfigService` for reading `FRONTEND_URL`.
- `../microsoft-graph/microsoft-graph.service` — `MicrosoftGraphService` for sending mail via MS Graph.

## How It Works

1. **Constructor** — Reads `FRONTEND_URL` from environment config (defaults to `http://localhost:4200`).
2. **`sendPasswordSetEmail(toEmail, userName, token)`** — Constructs an HTML email with a styled template containing a "Set My Password" button linking to the frontend's `/set-password` route with the token and email as query params. Sends via `graphService.sendMail()`.
3. **`escapeHtml(str)`** — Private utility to prevent XSS in email content by escaping `&`, `<`, `>`, `"`.
4. **`getFrontendUrl()`** — Getter exposing the configured frontend URL.

Errors during email sending are logged and re-thrown.
