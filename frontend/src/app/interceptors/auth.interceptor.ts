import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, throwError, catchError, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP interceptor that:
 * 1. Attaches the in-memory JWT access token as a Bearer header.
 * 2. On 401, attempts a silent token refresh then retries the original request.
 * 3. On second failure, redirects to /login.
 *
 * Requests to the auth endpoints themselves (/auth/login, /auth/refresh)
 * are NOT intercepted to avoid infinite loops.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Don't attach token to auth endpoints (prevents infinite loops)
  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = authService.accessToken;
  const authedReq = token ? addToken(req, token) : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint(req.url)) {
        // Try to refresh
        return from(authService.refreshAccessToken()).pipe(
          switchMap((newToken) => {
            if (newToken) {
              // Retry the original request with the new token
              return next(addToken(req, newToken));
            }
            // Refresh failed — redirect to login
            router.navigate(['/login']);
            return throwError(() => error);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
}

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login') || url.includes('/auth/refresh');
}
