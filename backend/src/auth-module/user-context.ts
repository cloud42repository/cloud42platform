import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AsyncLocalStorage } from 'async_hooks';

// ─── Async-local context for the current request's user ────────────────────────

export interface UserContext {
  /** User email extracted from the JWT (req.user.sub) */
  email: string;
}

const store = new AsyncLocalStorage<UserContext>();

/**
 * Returns the authenticated user's email for the current request,
 * or `undefined` when called outside a request scope.
 */
export function getCurrentUserEmail(): string | undefined {
  return store.getStore()?.email;
}

// ─── Global interceptor ───────────────────────────────────────────────────────

/**
 * Runs every request handler inside an AsyncLocalStorage context
 * so that services can call `getCurrentUserEmail()` without needing
 * the user email passed through every method parameter.
 *
 * Register globally in AppModule:
 *   providers: [{ provide: APP_INTERCEPTOR, useClass: UserContextInterceptor }]
 */
@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const email: string = req?.user?.sub ?? 'anonymous';

    return new Observable((subscriber) => {
      store.run({ email }, () => {
        next.handle().subscribe({
          next: (val) => subscriber.next(val),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
