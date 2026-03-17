import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../user/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Restrict access to users with the specified role(s).
 * Must be used together with RolesGuard.
 *
 * @example @Roles('admin')
 * @example @Roles('admin', 'manager')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
