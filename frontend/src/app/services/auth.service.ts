import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserRole } from '../config/user.types';

export interface CloudUser {
  name: string;
  email: string;
  firstName: string;
  photoUrl: string;
  idToken?: string;
  role?: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'cloud42_user';

  private _user = signal<CloudUser | null>(this.loadFromStorage());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  constructor(private router: Router) {}

  private loadFromStorage(): CloudUser | null {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  setUser(user: CloudUser): void {
    this._user.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /** Update the stored role without re-authenticating */
  patchRole(role: UserRole): void {
    const u = this._user();
    if (!u) return;
    const updated = { ...u, role };
    this._user.set(updated);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }
}
