# user.types.ts

This file defines the TypeScript type system for user management, including role definitions with labels and descriptions, and the stored user profile interface with per-module visibility permissions.

## Key Exports

- `UserRole` — Type union of platform roles: `'admin' | 'manager' | 'user'`
- `USER_ROLE_LABELS: Record<UserRole, string>` — Human-readable labels for each role
- `USER_ROLE_DESCRIPTIONS: Record<UserRole, string>` — Descriptions of each role's access level
- `StoredUser` — Interface for a stored user profile (email, name, photo, role, module visibility, timestamps)

## Dependencies

- None (pure type definitions and constants)

## How It Works

The file establishes a three-tier role system (admin, manager, user) with corresponding labels and access descriptions. The `StoredUser` interface represents a persisted user profile with a `moduleVisibility` record that maps module IDs to boolean enabled/disabled flags, allowing fine-grained per-module access control. Missing entries in `moduleVisibility` fall back to role-based defaults.
