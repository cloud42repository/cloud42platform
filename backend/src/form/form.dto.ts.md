# form.dto.ts

Data Transfer Object interfaces for the form module, defining request and response shapes.

## Key Exports

- **CreateFormDto** — Payload for creating a form (optional id, userEmail, name, description, fields, submitActions, status)
- **UpdateFormDto** — Payload for updating a form (all fields optional for partial updates)
- **FormResponseDto** — Standard API response shape with timestamps as ISO strings

## Dependencies

- `FormStatus` — Type import from `form.entity`

## How It Works

Pure TypeScript interfaces. `CreateFormDto` allows the client to supply an `id` or let the server generate one. `UpdateFormDto` uses optional fields for partial updates. `FormResponseDto` normalises entity data for the frontend, including both `fields` (form field definitions) and `submitActions` (post-submission workflows).
