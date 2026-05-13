# theme.service.ts

Manages the application's visual theme (light/dark mode and accent color) with reactive signals, DOM class application, and localStorage persistence.

## Key Exports

- **`ThemeMode`** — Type: `'light' | 'dark'`.
- **`ThemeColor`** — Type: `'blue' | 'green' | 'purple' | 'orange' | 'rose'`.
- **`ThemeState`** — Interface combining mode and color.
- **`ThemeService`** — Injectable service exposing `mode`, `color`, `themeClass` signals, and `setMode`, `setColor`, `toggleMode` methods.

## Dependencies

- `@angular/core` — `Injectable`, `signal`, `computed`, `effect`

## How It Works

1. **Restoration** — On construction, reads saved theme from localStorage (`c42_theme`). Falls back to light/blue defaults.
2. **Reactive effect** — An `effect` watches both `mode()` and `color()` signals. On change, it applies CSS classes to `<html>` (e.g., `theme-dark color-purple`), sets `document.body.style.colorScheme`, and persists to localStorage.
3. **DOM manipulation** — `applyToDOM` removes any existing `theme-*` / `color-*` classes from `<html>` before adding the current ones.
4. **`toggleMode()`** — Convenience method to flip between light and dark.
