# user-management.component.ts

This component provides a full user management interface for administrators. It displays all platform users in a sortable, filterable table with capabilities to add new users, change roles, approve/reject pending users, enable/disable accounts, reset passwords, and delete users.

## Key Exports

- **`UserManagementComponent`** — Standalone Angular component for user administration (selector: `app-user-management`)

## Template

The template contains:
- Page header with "Add User" and "Refresh" buttons
- Expandable add-user form card (email, name, photo URL, role selection)
- Filter card with search input, role filter, and status filter
- User table with sortable columns (name, email, role, status, actions)
- Action menu per user (change role, approve/reject, enable/disable, reset password, delete)
- Dialog template for role change confirmation

## Dependencies

- `@angular/material` — Table, Sort, Button, Icon, FormField, Input, Select, Snackbar, ProgressSpinner, Tooltip, Card, SlideToggle, Divider, Chips, Expansion, Dialog, Menu
- `UserApiService` / `UserResponse` — Backend API for user CRUD operations
- `UserManagementService` — Service managing user state and admin checks
- `AuthService` — Current authenticated user context
- `MODULES` — Module definitions for permission scoping
- `UserRole` / `USER_ROLE_LABELS` / `USER_ROLE_DESCRIPTIONS` — Role enum and display labels
- `TranslatePipe` / `TranslateService` — i18n support

## How It Works

The component loads all users on init via `UserApiService`, then applies client-side filtering (by search term, role, and status). Admins can add users directly with a specified role, or approve pending registrations. Role changes, account toggling, and deletions are confirmed via snackbar/dialog and immediately reflected in the local state. The table supports sorting by any column and pagination is handled via filtered signals.
