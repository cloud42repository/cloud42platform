# translate.service.ts

A lightweight i18n translation service supporting English, French, and German. Uses Angular signals for reactive language switching with localStorage persistence and browser language auto-detection.

## Key Exports

- **`Lang`** — Type alias: `'en' | 'fr' | 'de'`.
- **`TranslateService`** — Injectable service providing `lang` signal, `setLang()`, and `t(key, params?)` translation method.

## Dependencies

- `@angular/core` — `Injectable`, `signal`, `computed`
- `../i18n/en` — `EN` dictionary, `TranslationKey` type
- `../i18n/fr` — `FR` dictionary
- `../i18n/de` — `DE` dictionary

## How It Works

1. **Initialization** — On construction, restores the language from `localStorage` key `c42_lang`. Falls back to browser language detection, defaulting to English.
2. **`setLang(lang)`** — Updates the reactive signal and persists the choice to localStorage.
3. **`t(key, params?)`** — Looks up the key in the active dictionary (computed from `lang` signal). If `params` are provided, interpolates `{{paramName}}` placeholders in the translated string.
4. The dictionaries are statically imported, so all translations are bundled at build time.
