# application.dto.ts

Data Transfer Object interfaces for the application REST API — defines request and response shapes.

## Key Exports

- **CreateApplicationDto** — request body for `POST /api/applications` (userEmail, name, optional description/pages/navigation/status)
- **UpdateApplicationDto** — request body for `PUT /api/applications/:id` (all fields optional for partial updates)
- **ApplicationResponseDto** — response shape returned by all application endpoints (id, userEmail, name, description, pages, navigation, status, createdAt, updatedAt)

## Dependencies

- `ApplicationStatus` — imported from `application.entity`

## How It Works

Plain TypeScript interfaces serving as compile-time contracts. The response DTO ensures dates are serialized as ISO strings and all JSONB fields have appropriate types (`unknown[]` for pages, `unknown` for navigation). No runtime validation decorators are used.
