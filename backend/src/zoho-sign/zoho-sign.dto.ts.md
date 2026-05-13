# zoho-sign.dto.ts

TypeScript type definitions and interfaces for Zoho Sign API entities including documents, fields, recipients, requests, and templates.

## Key Exports

- **SignDocument** — Interface for document metadata within a sign request
- **SignFieldType** — Union type: signature, initial, checkbox, text, date, radio
- **SignField** — Interface for form fields with positioning and recipient assignment
- **RecipientRole** — Union type: signer, viewer, approver, in_person_signer
- **RecipientStatus** — Union type: pending, signed, viewed, refused, expired
- **SignRecipient** — Interface for request recipients with role and signing order
- **RequestStatus** — Union type: inprogress, completed, declined, expired, draft, recalled
- **SignRequest** — Interface for the full sign request with documents and recipients
- **CreateSignRequestDTO** — DTO for creating new sign requests with documents and actions
- **SignTemplate** — Interface for reusable sign templates
- **SignListParams** — Extended list parameters with status, search, and sort options

## Dependencies

- `ZohoListParams` from `../shared/shared.dto` — Base pagination parameters

## How It Works

Defines the data contracts used by the Sign controller, service, and client. Supports the full lifecycle from creating requests with document fields and recipients, through template-based request creation, to tracking request/recipient status.
