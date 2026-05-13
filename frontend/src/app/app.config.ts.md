# app.config.ts

Application-level configuration that defines the Angular providers used when bootstrapping the app. It sets up routing, HTTP client with interceptors, animations, and an app initializer for schema loading.

## Key Exports / Components

- `appConfig` — `ApplicationConfig` object containing all root-level providers:
  - `provideBrowserGlobalErrorListeners()` — Global error handlers
  - `provideRouter(routes, withComponentInputBinding())` — Router with component input binding
  - `provideHttpClient(withInterceptors([authInterceptor]))` — HTTP client with JWT auth interceptor
  - `provideAnimationsAsync()` — Async Angular Material animations
  - `provideAppInitializer(...)` — Preloads API schema data before app renders

## Dependencies

- `@angular/core` — ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideAppInitializer
- `@angular/router` — provideRouter, withComponentInputBinding
- `@angular/common/http` — provideHttpClient, withInterceptors
- `@angular/platform-browser/animations/async` — provideAnimationsAsync
- `SchemaService` — Service that fetches and caches API schema definitions
- `authInterceptor` — HTTP interceptor for JWT token attachment and refresh

## How It Works

The config is passed to `bootstrapApplication()` in `main.ts`. The app initializer uses `SchemaService.load()` to fetch the API schema before the application becomes interactive, ensuring all module/endpoint metadata is available from the start. The auth interceptor is registered globally so every HTTP request (except auth endpoints) automatically includes the Bearer token.
