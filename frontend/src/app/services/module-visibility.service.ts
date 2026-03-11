import { Injectable, signal, computed } from '@angular/core';
import { MODULES } from '../config/endpoints';

const STORAGE_KEY = 'cloud42_module_visibility';

@Injectable({ providedIn: 'root' })
export class ModuleVisibilityService {
  /** Map of moduleId → enabled (true/false). All modules enabled by default. */
  private readonly _visibility = signal<Record<string, boolean>>(this.loadFromStorage());

  readonly visibility = this._visibility.asReadonly();

  /** Only modules that are enabled */
  readonly enabledModules = computed(() => {
    const vis = this._visibility();
    return MODULES.filter(m => vis[m.id] !== false);
  });

  private loadFromStorage(): Record<string, boolean> {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      return json ? JSON.parse(json) : {};
    } catch {
      return {};
    }
  }

  private saveToStorage(data: Record<string, boolean>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  isEnabled(moduleId: string): boolean {
    return this._visibility()[moduleId] !== false;
  }

  setEnabled(moduleId: string, enabled: boolean): void {
    const updated = { ...this._visibility(), [moduleId]: enabled };
    this._visibility.set(updated);
    this.saveToStorage(updated);
  }

  /** Enable all modules at once */
  enableAll(): void {
    const updated: Record<string, boolean> = {};
    MODULES.forEach(m => updated[m.id] = true);
    this._visibility.set(updated);
    this.saveToStorage(updated);
  }

  /** Disable all modules at once */
  disableAll(): void {
    const updated: Record<string, boolean> = {};
    MODULES.forEach(m => updated[m.id] = false);
    this._visibility.set(updated);
    this.saveToStorage(updated);
  }
}
