# user.controller.ts

REST controller for user management. Exposes endpoints for listing users, registration (Google login and self-registration), admin operations (approve, revoke, resend invite), role assignment, password setting, and per-module visibility toggling.

## Key Exports

- **UserController** — NestJS controller handling all `/api/users` routes with role-based access control

## Dependencies

- `@nestjs/common` — Controller decorators (Get, Post, Patch, Delete, Param, Body)
- `UserService` — Business logic layer for user operations
- `user.dto` — Request DTO interfaces (RegisterLoginDto, RegisterDto, SetRoleDto, etc.)
- `Public` decorator — Marks routes as publicly accessible (no auth required)
- `Roles` decorator — Restricts routes to specific user roles

## How It Works

The controller delegates all logic to `UserService`. Routes are protected by default; the `@Public()` decorator opens login, registration, and password-set endpoints. Admin-only operations (findAll, approve, revoke, remove, setRole) are guarded with `@Roles('admin')`. Module visibility endpoints are accessible to both admins and managers. Each method maps a single HTTP verb + path to the corresponding service method.
