import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authGuard: CanActivateFn = async (
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (environment.mockMode) return true;

  if (auth.isLoggedIn() && auth.accessToken) return true;

  if (auth.isLoggedIn()) {
    const newToken = await auth.refreshAccessToken();
    if (newToken) return true;
  }

  // Preserve the attempted URL so login can redirect back
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
