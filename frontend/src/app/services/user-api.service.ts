import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { StoredUser, UserRole } from '../config/user.types';

export interface UserResponse {
  email: string;
  name: string;
  photoUrl: string;
  role: UserRole;
  status: 'pending' | 'active' | 'revoked';
  moduleVisibility: Record<string, boolean>;
  createdAt: string;
  lastLoginAt: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly api = inject(ApiService);
  private readonly prefix = '/users';

  /** GET /api/users — list all users */
  listAll(): Observable<UserResponse[]> {
    return this.api.get(this.prefix, '', {}, {}) as Observable<UserResponse[]>;
  }

  /** GET /api/users/:email — single user */
  getByEmail(email: string): Observable<UserResponse> {
    return this.api.get(this.prefix, '/:email', { email }) as Observable<UserResponse>;
  }

  /** POST /api/users/login — register or update on login */
  registerLogin(email: string, name: string, photoUrl: string): Observable<UserResponse> {
    return this.api.post(this.prefix, '/login', {}, { email, name, photoUrl }) as Observable<UserResponse>;
  }

  /** PATCH /api/users/:email/role — change role */
  setRole(email: string, role: UserRole): Observable<UserResponse> {
    return this.api.patch(this.prefix, '/:email/role', { email }, { role }) as Observable<UserResponse>;
  }

  /** DELETE /api/users/:email — remove user */
  remove(email: string): Observable<unknown> {
    return this.api.delete(this.prefix, '/:email', { email });
  }

  /** PATCH /api/users/:email/module-visibility — toggle one module */
  setModuleVisibility(email: string, moduleId: string, enabled: boolean): Observable<UserResponse> {
    return this.api.patch(this.prefix, '/:email/module-visibility', { email }, { moduleId, enabled }) as Observable<UserResponse>;
  }

  /** PATCH /api/users/:email/modules-bulk — bulk toggle */
  setAllModulesEnabled(email: string, moduleIds: string[], enabled: boolean): Observable<UserResponse> {
    return this.api.patch(this.prefix, '/:email/modules-bulk', { email }, { moduleIds, enabled }) as Observable<UserResponse>;
  }

  /* ── Registration & Admin actions ── */

  /** POST /api/users/register — self-registration (public) */
  register(email: string, name: string): Observable<UserResponse> {
    return this.api.post(this.prefix, '/register', {}, { email, name }) as Observable<UserResponse>;
  }

  /** POST /api/users/:email/approve — admin approves a pending user */
  approve(email: string): Observable<UserResponse> {
    return this.api.post(this.prefix, '/:email/approve', { email }) as Observable<UserResponse>;
  }

  /** POST /api/users/:email/revoke — admin revokes a user */
  revoke(email: string): Observable<UserResponse> {
    return this.api.post(this.prefix, '/:email/revoke', { email }) as Observable<UserResponse>;
  }

  /** POST /api/users/:email/resend-invite — admin re-sends the password-set email */
  resendInvite(email: string): Observable<UserResponse & { passwordSetLink: string }> {
    return this.api.post(this.prefix, '/:email/resend-invite', { email }) as Observable<UserResponse & { passwordSetLink: string }>;
  }

  /** POST /api/users/:email/set-password — set password with token (public) */
  setPassword(email: string, token: string, password: string): Observable<{ message: string }> {
    return this.api.post(this.prefix, '/:email/set-password', { email }, { token, password }) as Observable<{ message: string }>;
  }
}
