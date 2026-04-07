import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { UserRole } from '../config/user.types';
import { environment } from '../../environments/environment';

export interface CloudUser {
  name: string;
  email: string;
  firstName: string;
  photoUrl: string;
  role?: UserRole;
}

interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    email: string;
    name: string;
    photoUrl: string;
    role: UserRole;
    moduleVisibility: Record<string, boolean>;
    createdAt: string;
    lastLoginAt: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'cloud42_user';
  private readonly TOKEN_KEY = 'cloud42_access';
  private readonly REFRESH_KEY = 'cloud42_refresh';

  /**
   * JWT access token — persisted in sessionStorage so it survives page
   * refreshes within the same tab.  Also sent as Bearer header.
   */
  private _accessToken = signal<string | null>(this.loadToken(this.TOKEN_KEY));

  private _user = signal<CloudUser | null>(this.loadProfileFromStorage());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  /** Expose the access token for the HTTP interceptor */
  get accessToken(): string | null {
    return this._accessToken();
  }

  /** True when a refresh call is already in-flight (prevents duplicate refreshes) */
  private _refreshInFlight: Promise<string | null> | null = null;

  constructor(
    private readonly router: Router,
    private readonly http: HttpClient,
  ) {}

  /* ── Token persistence ── */

  private loadToken(key: string): string | null {
    try { return sessionStorage.getItem(key); } catch { return null; }
  }

  private saveTokens(access: string, refresh?: string): void {
    this._accessToken.set(access);
    try {
      sessionStorage.setItem(this.TOKEN_KEY, access);
      if (refresh) sessionStorage.setItem(this.REFRESH_KEY, refresh);
    } catch { /* quota / private-mode */ }
  }

  private clearTokens(): void {
    this._accessToken.set(null);
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.REFRESH_KEY);
    } catch { /* ignore */ }
  }

  /* ── Profile persistence (non-sensitive) ── */

  private loadProfileFromStorage(): CloudUser | null {
    try {
      const json = localStorage.getItem(this.STORAGE_KEY);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  private saveProfile(user: CloudUser): void {
    this._user.set(user);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /* ── Google Login → Backend ── */

  /**
   * Send the raw Google ID token to the backend for verification.
   * Receives JWT access + refresh tokens in body AND refresh as HttpOnly cookie.
   */
  async loginWithGoogle(googleIdToken: string): Promise<CloudUser> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${environment.apiBase}/auth/login`,
        { idToken: googleIdToken },
        { withCredentials: true },
      ),
    );

    this.saveTokens(res.accessToken, res.refreshToken);

    const user: CloudUser = {
      name: res.user.name,
      email: res.user.email,
      firstName: res.user.name?.split(' ')[0] ?? '',
      photoUrl: res.user.photoUrl,
      role: res.user.role,
    };
    this.saveProfile(user);
    return user;
  }

  /* ── Dev / Mock Login ── */

  /**
   * Login without Google — calls the backend dev-login endpoint.
   * Only works when the backend is running in MOCK_MODE.
   */
  async devLogin(email = 'mock@cloud42.dev', name = 'Mock User'): Promise<CloudUser> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${environment.apiBase}/auth/dev-login`,
        { email, name },
        { withCredentials: true },
      ),
    );

    this.saveTokens(res.accessToken, res.refreshToken);

    const user: CloudUser = {
      name: res.user.name,
      email: res.user.email,
      firstName: res.user.name?.split(' ')[0] ?? '',
      photoUrl: res.user.photoUrl ?? '',
      role: res.user.role,
    };
    this.saveProfile(user);
    return user;
  }

  /* ── Token Refresh ── */

  /**
   * Silently refresh the access token.
   * Tries the HttpOnly cookie first; falls back to the refresh token
   * stored in sessionStorage (needed for cross-origin Azure deployments).
   */
  async refreshAccessToken(): Promise<string | null> {
    // Deduplicate concurrent refresh calls
    if (this._refreshInFlight) return this._refreshInFlight;

    this._refreshInFlight = this._doRefresh();
    try {
      return await this._refreshInFlight;
    } finally {
      this._refreshInFlight = null;
    }
  }

  private async _doRefresh(): Promise<string | null> {
    try {
      // Send stored refresh token in body as fallback for cross-origin cookie issues
      const storedRefresh = this.loadToken(this.REFRESH_KEY);
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(
          `${environment.apiBase}/auth/refresh`,
          storedRefresh ? { refreshToken: storedRefresh } : {},
          { withCredentials: true },
        ),
      );

      this.saveTokens(res.accessToken, res.refreshToken);

      // Sync user profile (role may have changed)
      const user: CloudUser = {
        name: res.user.name,
        email: res.user.email,
        firstName: res.user.name?.split(' ')[0] ?? '',
        photoUrl: res.user.photoUrl,
        role: res.user.role,
      };
      this.saveProfile(user);

      return res.accessToken;
    } catch {
      // Refresh failed — session expired
      this.clearTokens();
      return null;
    }
  }

  /* ── Role patch ── */

  /** Update the stored role without re-authenticating */
  patchRole(role: UserRole): void {
    const u = this._user();
    if (!u) return;
    const updated = { ...u, role };
    this.saveProfile(updated);
  }

  /* ── Logout ── */

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(
          `${environment.apiBase}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: this._accessToken()
              ? { Authorization: `Bearer ${this._accessToken()}` }
              : {},
          },
        ),
      );
    } catch {
      // Best-effort — still clear local state
    }

    this.clearTokens();
    this._user.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }
}
