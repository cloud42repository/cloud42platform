import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'rose';

export interface ThemeState {
  mode: ThemeMode;
  color: ThemeColor;
}

const STORAGE_KEY = 'c42_theme';

const DEFAULTS: ThemeState = { mode: 'light', color: 'blue' };

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.restore().mode);
  readonly color = signal<ThemeColor>(this.restore().color);

  /** CSS class to apply on <html>: e.g. "theme-dark color-purple" */
  readonly themeClass = computed(() => `theme-${this.mode()} color-${this.color()}`);

  constructor() {
    effect(() => {
      const m = this.mode();
      const c = this.color();
      this.applyToDOM(m, c);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode: m, color: c }));
    });

    // Apply immediately on construction
    this.applyToDOM(this.mode(), this.color());
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  setColor(color: ThemeColor): void {
    this.color.set(color);
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'light' ? 'dark' : 'light');
  }

  private applyToDOM(mode: ThemeMode, color: ThemeColor): void {
    const html = document.documentElement;
    // Remove old theme/color classes
    html.classList.forEach(cls => {
      if (cls.startsWith('theme-') || cls.startsWith('color-')) {
        html.classList.remove(cls);
      }
    });
    html.classList.add(`theme-${mode}`, `color-${color}`);

    // Update color-scheme for native browser handling
    document.body.style.colorScheme = mode;
  }

  private restore(): ThemeState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.mode && parsed.color) return parsed;
      }
    } catch { /* ignore */ }
    return DEFAULTS;
  }
}
