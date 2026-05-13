# roles.guard.ts

Role-based authorization guard that restricts route access based on user roles. Only enforces when the `@Roles()` decorator is present. Reads the user's current role from the database (not the JWT) so that role changes by admins take effect immediately.

## Key Exports

- `RolesGuard` — Injectable guard implementing `CanActivate`

## Dependencies

- `@nestjs/common` — CanActivate, ExecutionContext, ForbiddenException, Injectable
- `@nestjs/core` — Reflector for reading metadata
- `./roles.decorator` — ROLES_KEY metadata key
- `./jwt.strategy` — JwtPayload type
- `../user/user.entity` — UserRole type
- `../user/user.service` — UserService for fetching current role from DB

## How It Works

1. Uses Reflector to check if `@Roles()` metadata is present on the handler or controller
2. If no roles are required, the guard passes (allows access)
3. Extracts the user's email from `request.user.sub` (set by JwtAuthGuard)
4. Queries the database via `UserService.findByEmail()` to get the current role (ensures real-time role enforcement)
5. If the user's DB role is not in the required roles list, throws `ForbiddenException`
6. Patches `request.user.role` with the fresh DB value so downstream handlers see the updated role
