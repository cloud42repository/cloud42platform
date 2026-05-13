# roles.decorator.ts

Custom decorator for restricting route access to specific user roles. Used in conjunction with `RolesGuard` to enforce role-based authorization.

## Key Exports

- `ROLES_KEY` — Metadata key string (`'roles'`) used by the Reflector in RolesGuard
- `Roles(...roles: UserRole[])` — Parameter decorator that sets required roles metadata on a handler or controller

## Dependencies

- `@nestjs/common` — SetMetadata utility
- `../user/user.entity` — UserRole type for type-safe role values

## How It Works

The `Roles` function calls `SetMetadata(ROLES_KEY, roles)` to attach an array of allowed roles to the route handler's metadata. The `RolesGuard` then reads this metadata via NestJS's `Reflector` to determine whether the authenticated user has sufficient permissions. Usage: `@Roles('admin')` or `@Roles('admin', 'manager')`.
