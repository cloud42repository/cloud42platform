# jwt.strategy.ts

Passport JWT strategy for NestJS that extracts and validates Bearer tokens from the Authorization header. Defines the `JwtPayload` interface used throughout the auth system.

## Key Exports

- `JwtStrategy` — Injectable Passport strategy that validates JWT tokens
- `JwtPayload` — Interface with `sub` (email), `name`, and `role` fields

## Dependencies

- `@nestjs/passport` — PassportStrategy base class
- `passport-jwt` — ExtractJwt and Strategy for JWT extraction/validation
- `@nestjs/config` — ConfigService for reading `JWT_SECRET`

## How It Works

1. Configures Passport to extract the JWT from the `Authorization: Bearer <token>` header
2. Uses `JWT_SECRET` from environment (default: `'change-me-in-production'`) as the verification key
3. Does not ignore token expiration (`ignoreExpiration: false`)
4. The `validate()` method is called after successful verification — it simply returns the decoded payload, which Passport attaches to `request.user`
