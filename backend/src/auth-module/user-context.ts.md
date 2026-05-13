# user-context.ts

Provides request-scoped user context using Node.js `AsyncLocalStorage`, allowing any service in the call chain to access the current user's email without passing it through every method parameter.

## Key Exports

- `UserContext` — Interface with an `email` field
- `getCurrentUserEmail()` — Function that returns the authenticated user's email for the current request (or `undefined` outside a request)
- `UserContextInterceptor` — NestJS interceptor that wraps each request handler in an AsyncLocalStorage context

## Dependencies

- `@nestjs/common` — Injectable, NestInterceptor, ExecutionContext, CallHandler
- `rxjs` — Observable for interceptor return type
- `async_hooks` — AsyncLocalStorage for propagating context across async boundaries

## How It Works

1. `UserContextInterceptor` is registered globally via `APP_INTERCEPTOR` in `AppModule`
2. On each request, it extracts `req.user.sub` (the user's email from the JWT) or defaults to `'anonymous'`
3. Wraps the downstream handler execution inside `AsyncLocalStorage.run()` with the user context
4. Any service can call `getCurrentUserEmail()` to retrieve the email without needing it passed as a parameter — useful for audit logging, multi-tenant data filtering, etc.
