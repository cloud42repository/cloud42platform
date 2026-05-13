# main.ts

The application entry point that bootstraps the Angular standalone application. It initializes the root `App` component with the provided application configuration and logs any bootstrap errors to the console.

## Key Exports / Components

- (No named exports — this is the bootstrap entry point)

## Dependencies

- `bootstrapApplication` — Angular platform-browser bootstrap function
- `appConfig` — Application-level provider configuration from `./app/app.config`
- `App` — Root component from `./app/app`

## How It Works

Calls `bootstrapApplication(App, appConfig)` which creates the Angular application instance, registers all providers defined in `appConfig`, and renders the `App` component into the DOM. Any errors during bootstrap are caught and logged via `console.error`.
