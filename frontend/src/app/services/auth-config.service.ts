import { Injectable, signal } from '@angular/core';
import { AuthConfig, AuthType, ModuleAuthSetting } from '../config/auth-config.types';

const STORAGE_KEY = 'cloud42_auth_configs';

@Injectable({ providedIn: 'root' })
export class AuthConfigService {
  private readonly _configs = signal<Record<string, AuthConfig>>(this.loadFromStorage());

  readonly configs = this._configs.asReadonly();

  private loadFromStorage(): Record<string, AuthConfig> {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }

  private saveToStorage(data: Record<string, AuthConfig>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  getConfig(moduleId: string): AuthConfig {
    return this._configs()[moduleId] ?? { type: 'none' };
  }

  saveConfig(moduleId: string, config: AuthConfig): void {
    const updated = { ...this._configs(), [moduleId]: config };
    this._configs.set(updated);
    this.saveToStorage(updated);
  }

  deleteConfig(moduleId: string): void {
    const updated = { ...this._configs() };
    delete updated[moduleId];
    this._configs.set(updated);
    this.saveToStorage(updated);
  }

  getAllSettings(): ModuleAuthSetting[] {
    return Object.entries(this._configs()).map(([moduleId, config]) => ({ moduleId, config }));
  }

  hasConfig(moduleId: string): boolean {
    const c = this._configs()[moduleId];
    return !!c && c.type !== 'none';
  }
}
