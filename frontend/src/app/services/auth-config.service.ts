import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthConfig, AuthType, ModuleAuthSetting } from '../config/auth-config.types';
import { environment } from '../../environments/environment';

interface AuthConfigResponse {
  moduleId: string;
  config: AuthConfig;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthConfigService {
  private readonly apiUrl = `${environment.apiBase}/auth-configs`;
  private readonly _configs = signal<Record<string, AuthConfig>>({});
  private _loaded = false;

  readonly configs = this._configs.asReadonly();

  constructor(private readonly http: HttpClient) {}

  /* ── Load all configs from backend ── */

  async loadAll(): Promise<void> {
    if (this._loaded) return;
    try {
      const res = await firstValueFrom(
        this.http.get<AuthConfigResponse[]>(this.apiUrl, { withCredentials: true }),
      );
      const map: Record<string, AuthConfig> = {};
      for (const item of res ?? []) {
        map[item.moduleId] = item.config;
      }
      this._configs.set(map);
      this._loaded = true;
    } catch (err) {
      console.error('Failed to load auth configs from backend', err);
    }
  }

  getConfig(moduleId: string): AuthConfig {
    return this._configs()[moduleId] ?? { type: 'none' as AuthType };
  }

  async saveConfig(moduleId: string, config: AuthConfig): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<AuthConfigResponse>(
          `${this.apiUrl}/${encodeURIComponent(moduleId)}`,
          { config },
          { withCredentials: true },
        ),
      );
      const updated = { ...this._configs(), [moduleId]: config };
      this._configs.set(updated);
    } catch (err) {
      console.error(`Failed to save auth config for ${moduleId}`, err);
      throw err;
    }
  }

  async deleteConfig(moduleId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/${encodeURIComponent(moduleId)}`, {
          withCredentials: true,
        }),
      );
      const updated = { ...this._configs() };
      delete updated[moduleId];
      this._configs.set(updated);
    } catch (err) {
      console.error(`Failed to delete auth config for ${moduleId}`, err);
      throw err;
    }
  }

  getAllSettings(): ModuleAuthSetting[] {
    return Object.entries(this._configs()).map(([moduleId, config]) => ({ moduleId, config }));
  }

  hasConfig(moduleId: string): boolean {
    const c = this._configs()[moduleId];
    return !!c && c.type !== 'none';
  }
}
