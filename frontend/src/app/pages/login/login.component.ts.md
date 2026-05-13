# login.component.ts

This component provides the login and registration page for the Cloud42 Platform. It supports multiple authentication methods including Google Sign-In, Microsoft (MSAL) login, email/password login, and a development mock login mode. It also includes a registration tab for new user sign-up with admin approval workflow.

## Key Exports

- **`LoginComponent`** — Standalone Angular component handling authentication UI and logic (selector: `app-login`)
- **`GisCredentialResponse`** — Interface for Google Identity Services credential response
- **`GoogleGsi`** — Interface typing the Google GSI global object

## Template

The template features a centered login card with:
- Brand header (logo, title, subtitle)
- Tab toggle between "Sign In" and "Register" modes
- Sign In mode: Google button, Microsoft button, password form, dev login (mock mode)
- Register mode: Name/email form with success confirmation
- Error messages and footer text

## Dependencies

- `@angular/core` — Component, OnInit, AfterViewInit, ElementRef, ViewChild
- `@angular/router` — Router, ActivatedRoute (for redirect after login)
- `@angular/forms` — FormsModule (template-driven forms)
- `rxjs` — firstValueFrom
- `AuthService` — Core authentication service (Google, Microsoft, password, dev login)
- `UserApiService` — User registration API calls
- `environment` — Environment config (mock mode, client IDs)
- `@azure/msal-browser` — Dynamic import for Microsoft login

## How It Works

On init, the component checks if the user is already authenticated and redirects if so. It also handles MSAL redirect responses (hash-based auth codes). In AfterViewInit, it loads the Google GSI script and renders the Google Sign-In button. The component supports three login flows: Google (ID token sent to backend), Microsoft (MSAL redirect flow), and email/password (direct API call). Registration submits name/email for admin approval. After successful login, the user is redirected to a return URL or the dashboards page.
