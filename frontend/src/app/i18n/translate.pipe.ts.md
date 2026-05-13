# translate.pipe.ts

Angular pipe that provides template-level access to the translation service. Allows components to translate i18n keys directly in templates using the `| t` syntax.

## Key Exports / Components

- `TranslatePipe` — Standalone Angular pipe (`name: 't'`, impure) that:
  - Accepts a `TranslationKey` and optional interpolation params
  - Returns the translated string for the current language
  - Re-evaluates automatically when the language changes (impure pipe)

## Dependencies

- `@angular/core` — Pipe, PipeTransform, inject
- `TranslationKey` type from `../i18n/en` — Type-safe translation key constraint
- `TranslateService` — Service that resolves keys to localized strings

## How It Works

The pipe injects `TranslateService` and delegates to its `t(key, params)` method. Being marked as `pure: false`, Angular re-runs the pipe's `transform` method on every change detection cycle, ensuring the UI updates immediately when the user switches languages (since the active language is tracked via a signal in `TranslateService`). Usage in templates:

```html
{{ 'nav.settings' | t }}
{{ 'users.role-updated' | t : { role: 'Admin' } }}
```
