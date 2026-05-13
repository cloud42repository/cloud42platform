# zoho-api-exception.filter.ts

Global NestJS exception filter that converts raw Axios errors and Zoho-specific API errors into structured, meaningful HTTP responses. Prevents generic 500 errors from reaching the frontend.

## Key Exports

- **`ZohoApiExceptionFilter`** — Class decorated with `@Catch()` implementing NestJS `ExceptionFilter`.

## Dependencies

- `@nestjs/common` — `ExceptionFilter`, `Catch`, `ArgumentsHost`, `HttpException`, `Logger`.
- `express` — `Response` type.
- `axios` — `AxiosError` class.
- `../base/ZohoBaseClient` — `ZohoApiError` custom error class.

## How It Works

The filter handles exceptions in priority order:

1. **NestJS `HttpException`** — Forwarded as-is with its original status code and body.
2. **`ZohoApiError`** — Business-level errors from Zoho (often returned with HTTP 200 but a non-zero `code` field). Returns the Zoho error code and message with an appropriate HTTP status.
3. **`AxiosError`** — HTTP-level failures from upstream APIs. Extracts the most useful message from the response body and returns it with the upstream status code (or 502).
4. **Unknown errors** — Returns 500 with the error message and logs the stack trace.

All non-trivial errors are logged via NestJS Logger for observability.
