# auth.module.ts

NestJS module that configures the authentication subsystem. Sets up JWT-based authentication with Passport, registers global guards for authentication and role-based authorization, and exposes `AuthService` for use by other modules.

## Key Exports

- `AuthModule` — Module class that bundles auth controller, service, strategy, and guards
- `AuthService` — Exported for use by other modules needing token operations

## Dependencies

- `@nestjs/jwt` — JwtModule for token signing/verification
- `@nestjs/passport` — PassportModule for strategy integration
- `@nestjs/config` — ConfigModule/ConfigService for reading JWT_SECRET and JWT_EXPIRY
- `@nestjs/core` — APP_GUARD token for registering global guards
- `../user/user.module` — Provides UserService for user lookups

## How It Works

1. Imports `UserModule` to access user persistence
2. Registers PassportModule with `jwt` as default strategy
3. Configures `JwtModule` asynchronously using `JWT_SECRET` and `JWT_EXPIRY` from environment
4. Provides `AuthService` and `JwtStrategy` for token handling
5. Registers `JwtAuthGuard` as a global guard — all routes require a valid JWT unless decorated with `@Public()`
6. Registers `RolesGuard` as a global guard — enforces role restrictions only when `@Roles()` is present
