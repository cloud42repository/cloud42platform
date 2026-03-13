import { Injectable, signal, computed } from '@angular/core';
import { EN, type TranslationKey } from '../i18n/en';
import { FR } from '../i18n/fr';

export type Lang = 'en' | 'fr';

const DICTIONARIES: Record<Lang, Record<TranslationKey, string>> = { en: EN, fr: FR };
const STORAGE_KEY = 'c42_lang';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  /** Current language as a signal. */
  readonly lang = signal<Lang>(this.restore());

  /** The active dictionary (recomputed when lang changes). */
  private readonly dict = computed(() => DICTIONARIES[this.lang()]);

  /** Switch language and persist the choice. */
  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  /**
   * Translate a key, optionally interpolating `{{param}}` placeholders.
   *
   * @example t('users.role-updated', { role: 'Admin' })
   */
  t(key: TranslationKey, params?: Record<string, string | number>): string {
    let value = this.dict()[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }
    return value;
  }

  /* ── private ── */

  private restore(): Lang {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
    // auto-detect browser language
    const browserLang = navigator.language?.slice(0, 2);
    return browserLang === 'fr' ? 'fr' : 'en';
  }
}
