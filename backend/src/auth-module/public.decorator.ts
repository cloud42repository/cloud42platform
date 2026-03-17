import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a controller or handler as public — the global JwtAuthGuard
 * will skip token verification for decorated routes.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
