# fr.ts

French translation dictionary for the application's i18n system. Provides complete French translations for all UI strings, typed against `TranslationKey` to ensure parity with the English source.

## Key Exports / Components

- `FR` — `Record<TranslationKey, string>` object containing French translations for all application strings, including:
  - App Shell, Sidebar, Settings, Workflows, Dashboards, Forms, Applications, Users, Login, Shares, and all other sections

## Dependencies

- `TranslationKey` type from `./en` — Ensures the French file covers every key defined in the English source

## How It Works

Exports a typed record that maps every `TranslationKey` to its French equivalent. The `Record<TranslationKey, string>` type annotation causes a compile-time error if any key is missing or if an unknown key is added, keeping all translations in sync. Interpolation variables (e.g., `{{name}}`, `{{count}}`) are preserved in the translated strings.
