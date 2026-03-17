import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

/**
 * Route guard that protects pages behind authentication.
 *
 * If the user has a profile but no in-memory access token
 * (e.g. page refresh), it attempts a silent token refresh
 * using the HttpOnly refresh-token cookie before redirecting.
 *
 * In mock mode the guard always passes — no real auth is needed.
 */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Mock mode — skip authentication entirely
  if (environment.mockMode) return true;

  // Already fully authenticated
  if (auth.isLoggedIn() && auth.accessToken) return true;

  // Profile exists but token lost (page reload) — try silent refresh
  if (auth.isLoggedIn() && !auth.accessToken) {
    const newToken = await auth.refreshAccessToken();
    if (newToken) return true;
  }

  return router.createUrlTree(['/login']);
};
