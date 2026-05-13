# user.dto.ts

Data Transfer Object interfaces for the user module, defining the shape of request payloads and API responses.

## Key Exports

- **RegisterLoginDto** — Payload for Google login upsert (email, name, photoUrl)
- **RegisterDto** — Payload for self-registration (email, name)
- **SetRoleDto** — Payload for changing a user's role
- **SetModuleVisibilityDto** — Payload for toggling a single module's visibility
- **SetAllModulesDto** — Payload for bulk-toggling multiple modules
- **SetPasswordDto** — Payload for setting a password with a token
- **PasswordLoginDto** — Payload for email + password login
- **UserResponseDto** — Standard response shape returned by all user endpoints

## Dependencies

- `UserRole`, `UserStatus` — Type imports from `user.entity`

## How It Works

Pure TypeScript interfaces with no runtime overhead. Request DTOs define the expected body structure for each endpoint. `UserResponseDto` provides a consistent serialised view of a user (email, name, photoUrl, role, status, moduleVisibility, timestamps as ISO strings), matching the frontend's `StoredUser` model.
