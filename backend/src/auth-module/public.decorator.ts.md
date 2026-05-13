# public.decorator.ts

Custom decorator that marks a controller or route handler as publicly accessible, bypassing the global JWT authentication guard.

## Key Exports

- `IS_PUBLIC_KEY` — Metadata key string (`'isPublic'`) used by JwtAuthGuard to identify public routes
- `Public()` — Decorator function that sets the `isPublic` metadata to `true`

## Dependencies

- `@nestjs/common` — SetMetadata utility

## How It Works

The `Public` function calls `SetMetadata(IS_PUBLIC_KEY, true)` to mark a route. The global `JwtAuthGuard` checks for this metadata via Reflector — if present, it skips JWT token verification entirely, allowing unauthenticated access to the decorated endpoint. Typically used for login, registration, and health-check routes.
