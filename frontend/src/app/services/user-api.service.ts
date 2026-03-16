import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { StoredUser, UserRole } from '../config/user.types';

export interface UserResponse {
  email: string;
  name: string;
  photoUrl: string;
  role: UserRole;
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
}
