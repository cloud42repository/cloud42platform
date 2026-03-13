import { Pipe, PipeTransform, inject } from '@angular/core';
import type { TranslationKey } from '../i18n/en';
import { TranslateService } from '../services/translate.service';

/**
 * Usage:  {{ 'nav.settings' | t }}
 *         {{ 'users.role-updated' | t : { role: 'Admin' } }}
 *
 * The pipe is **impure** so it re-evaluates when the language signal changes.
 */
@Pipe({ name: 't', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslateService);

  transform(key: TranslationKey, params?: Record<string, string | number>): string {
    return this.i18n.t(key, params);
  }
}
