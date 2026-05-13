# environment.ts

Development environment configuration file. Provides runtime settings used throughout the application when running in local development mode (e.g., via `ng serve`).

## Key Exports / Components

- `environment` — Configuration object with the following properties:
  - `production` — `false` (marks development mode)
  - `mockMode` — `false` (set to `true` to bypass real OAuth login)
  - `apiBase` — Backend API URL (`http://localhost:3000/api`)
  - `googleClientId` — Google OAuth 2.0 client ID
  - `microsoftClientId` — Microsoft Azure AD application (client) ID
  - `microsoftTenantId` — Microsoft Azure AD tenant ID

## Dependencies

- None (standalone configuration object)

## How It Works

Exports a plain constant object consumed by services and guards across the application. Angular's file replacement mechanism (in `angular.json`) swaps this file with `environment.prod.ts` during production builds.
