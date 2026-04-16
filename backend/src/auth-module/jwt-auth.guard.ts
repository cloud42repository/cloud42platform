import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { JwtPayload } from './jwt.strategy';

/**
 * Global JWT auth guard.
 * All routes are protected by default.
 * Use @Public() decorator to opt-out a specific route.
 *
 * In MOCK_MODE the guard is fully bypassed: a synthetic user is
 * attached to every request so downstream code still has `req.user`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly isMockMode = process.env['MOCK_MODE'] === 'true';

  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // In mock mode, skip JWT verification and inject a synthetic user
    if (this.isMockMode) {
      const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
      request.user ??= {
        sub: 'mock@cloud42.dev',
        name: 'Mock User',
        role: 'admin',
      };
      return true;
    }

    return super.canActivate(context);
  }
}
