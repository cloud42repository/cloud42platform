# user.service.ts

Core business logic for user lifecycle management including registration, login upsert, admin approval with email invitations, password hashing/validation, role assignment, module visibility, and refresh-token storage.

## Key Exports

- **UserService** — Injectable service providing all user-related operations

## Dependencies

- `@nestjs/common` — Exception classes (NotFoundException, BadRequestException, ForbiddenException)
- `typeorm` / `@nestjs/typeorm` — Repository for database access
- `node:crypto` — Secure random token generation and SHA-256 hashing
- `bcryptjs` — Password hashing and comparison
- `UserEntity`, `UserRole`, `UserStatus` — Entity and type definitions
- `EmailService` — Sends password-set activation emails via SendGrid

## How It Works

The service uses a TypeORM repository for `UserEntity`. Key flows:

1. **registerLogin** — Upserts a user on Google login; the first-ever user automatically becomes admin.
2. **register** — Creates a user with `pending` status for self-registration (awaits admin approval).
3. **approveUser** — Generates a SHA-256-hashed token, sets status to `active`, and sends an activation email with a raw token link.
4. **setPassword** — Validates the token, checks expiry, then stores a bcrypt-hashed password (salt rounds = 12) and clears the one-time token.
5. **validatePassword** — Compares a plain password against the stored bcrypt hash for login; rejects non-active users.
6. **Module visibility** — Merges per-module boolean flags into the user's JSONB `moduleVisibility` column.
7. **Refresh tokens** — Stores/retrieves a hashed refresh token for JWT rotation.
