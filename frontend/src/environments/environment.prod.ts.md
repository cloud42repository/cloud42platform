# environment.prod.ts

Production environment configuration file. Provides runtime settings for the deployed application on Azure, including the production API base URL and OAuth client IDs.

## Key Exports / Components

- `environment` — Configuration object with the following properties:
  - `production` — `true` (enables production optimizations)
  - `mockMode` — `false`
  - `apiBase` — Production backend URL on Azure App Service
  - `googleClientId` — Google OAuth 2.0 client ID
  - `microsoftClientId` — Microsoft Azure AD application (client) ID
  - `microsoftTenantId` — Microsoft Azure AD tenant ID

## Dependencies

- None (standalone configuration object)

## How It Works

This file replaces `environment.ts` during production builds via Angular's `fileReplacements` configuration. All values point to the production Azure-hosted backend and use the same OAuth credentials as development (adjust as needed for separate environments).
