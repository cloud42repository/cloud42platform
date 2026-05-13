# en.ts

English translation dictionary for the application's internationalization (i18n) system. Serves as the primary/default locale and defines the `TranslationKey` type used across all language files.

## Key Exports / Components

- `EN` — `const` object mapping translation keys to English strings, organized by sections:
  - App Shell — title, menu toggle, sign-out
  - Sidebar — navigation labels
  - Settings — configuration page labels
  - Workflows — workflow builder/list/execution labels
  - Dashboards — dashboard builder labels
  - Forms — form builder labels
  - Applications — application management labels
  - Users — user management labels
  - Login — authentication labels
  - Shares — shared view labels
  - And more (notifications, API tester, agent, etc.)
- `TranslationKey` — Type alias (`keyof typeof EN`) representing all valid translation keys; used by other locale files to ensure type-safe completeness

## Dependencies

- None (standalone translation data)

## How It Works

The file exports a frozen (`as const`) object of key-value string pairs. The keys use a dot-notation namespace (e.g., `'workflow.save'`). Interpolation placeholders use `{{variable}}` syntax (e.g., `'{{count}} steps'`). The exported `TranslationKey` type is imported by `de.ts`, `fr.ts`, and the `TranslatePipe` to ensure all translations cover the exact same set of keys.
