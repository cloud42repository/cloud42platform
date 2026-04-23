import { Injectable, signal, computed, inject, effect, untracked } from '@angular/core';
import { StoredUser, UserRole } from '../config/user.types';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'cloud42_users';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly auth = inject(AuthService);

  /** All registered users in the platform */
  private readonly _users = signal<StoredUser[]>(this.loadFromStorage());

  readonly users = this._users.asReadonly();

  constructor() {
    // Keep _users in sync with the role returned by the backend (login / token refresh).
    effect(() => {
      const u = this.auth.user();
      if (!u?.email || !u.role) return;

      const users = untracked(() => this._users());
      const existing = users.find(s => s.email === u.email);

      if (existing) {
        if (existing.role !== u.role) {
          // Role changed on the backend — sync it locally
          const updated = users.map(s =>
            s.email === u.email ? { ...s, role: u.role! } : s,
          );
          untracked(() => this.save(updated));
        }
      } else {
        // First time this user appears — add them
        const now = new Date().toISOString();
        const newUser: StoredUser = {
          email: u.email,
          name: u.name,
          photoUrl: u.photoUrl ?? '',
          role: u.role,
          moduleVisibility: {},
          createdAt: now,
          lastLoginAt: now,
        };
        untracked(() => this.save([...users, newUser]));
      }
    });
  }

  /** The currently logged-in stored user (with role info) */
  readonly currentUser = computed<StoredUser | null>(() => {
    const email = this.auth.user()?.email;
    if (!email) return null;
    return this._users().find(u => u.email === email) ?? null;
  });

  /** Role of the current user */
  readonly currentRole = computed<UserRole>(() => {
    return this.currentUser()?.role ?? 'user';
  });

  /** Whether the current user can manage other users */
  readonly isAdmin = computed(() => this.currentRole() === 'admin');

  /** Whether the current user can edit module visibility */
  readonly canEditModules = computed(() => {
    const r = this.currentRole();
    return r === 'admin' || r === 'manager';
  });

  /* ── Storage ── */
  private loadFromStorage(): StoredUser[] {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  private save(users: StoredUser[]): void {
    this._users.set(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  /* ── User registration (called on Google login) ── */

  /**
   * Ensures the Google-authenticated user exists in the store.
   * First-ever user becomes Admin automatically.
   */
  registerLogin(email: string, name: string, photoUrl: string): StoredUser {
    const list = [...this._users()];
    const existing = list.find(u => u.email === email);
    const now = new Date().toISOString();

    if (existing) {
      // Update last login + profile info
      existing.name = name;
      existing.photoUrl = photoUrl;
      existing.lastLoginAt = now;
      this.save(list);
      return existing;
    }

    // New user — first one is admin
    const role: UserRole = list.length === 0 ? 'admin' : 'user';
    const newUser: StoredUser = {
      email,
      name,
      photoUrl,
      role,
      moduleVisibility: {},   // empty = all enabled for admin/manager, all disabled for user
      createdAt: now,
      lastLoginAt: now,
    };
    list.push(newUser);
    this.save(list);
    return newUser;
  }

  /* ── Role management (admin only) ── */

  setRole(email: string, role: UserRole): void {
    const list = this._users().map(u =>
      u.email === email ? { ...u, role } : u,
    );
    this.save(list);
  }

  /** Remove a user completely */
  removeUser(email: string): void {
    const list = this._users().filter(u => u.email !== email);
    this.save(list);
  }

  /* ── Per-user module visibility ── */

  getModuleVisibility(email: string): Record<string, boolean> {
    return this._users().find(u => u.email === email)?.moduleVisibility ?? {};
  }

  setModuleEnabled(email: string, moduleId: string, enabled: boolean): void {
    const list = this._users().map(u => {
      if (u.email !== email) return u;
      return { ...u, moduleVisibility: { ...u.moduleVisibility, [moduleId]: enabled } };
    });
    this.save(list);
  }

  setAllModulesEnabled(email: string, moduleIds: string[], enabled: boolean): void {
    const list = this._users().map(u => {
      if (u.email !== email) return u;
      const vis = { ...u.moduleVisibility };
      moduleIds.forEach(id => vis[id] = enabled);
      return { ...u, moduleVisibility: vis };
    });
    this.save(list);
  }
}
