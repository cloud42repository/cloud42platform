import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { JwtPayload } from './jwt.strategy';
import { lastValueFrom, isObservable, Observable } from 'rxjs';

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

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // In mock mode, try to validate the JWT if present; fall back to a synthetic user
    if (this.isMockMode) {
      return this.mockActivate(context);
    }

    return super.canActivate(context) as boolean | Promise<boolean> | Observable<boolean>;
  }

  private async mockActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload; headers?: Record<string, string> }>();
    const authHeader = request.headers?.['authorization'] ?? '';
    if (authHeader.startsWith('Bearer ')) {
      try {
        const result = super.canActivate(context);
        const ok = isObservable(result)
          ? await lastValueFrom(result)
          : await result;
        if (ok) return true;
      } catch {
        // Token invalid/expired — fall through to default mock user
      }
    }
    request.user ??= {
      sub: 'mock@cloud42.dev',
      name: 'Mock User',
      role: 'admin',
    };
    return true;
  }
}
