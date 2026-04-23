import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { JwtPayload } from './jwt.strategy';
import type { UserRole } from '../user/user.entity';
import { UserService } from '../user/user.service';

/**
 * Role-based authorisation guard.
 * Apply @Roles('admin') (or multiple) on a handler or controller.
 * If no @Roles decorator is present, the guard passes.
 *
 * Reads the role from the database (not the JWT) so that
 * role changes take effect immediately.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles decorator → allow
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Insufficient permissions');

    // Read the current role from DB so admin changes take effect immediately
    const dbUser = await this.userService.findByEmail(user.sub);
    const currentRole = dbUser?.role as UserRole | undefined;

    if (!currentRole || !requiredRoles.includes(currentRole)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Patch the request so downstream handlers see the fresh role
    user.role = currentRole;
    return true;
  }
}
