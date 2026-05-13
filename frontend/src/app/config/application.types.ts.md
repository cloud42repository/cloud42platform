# application.types.ts

This file defines the TypeScript type system for the application builder feature, which allows users to compose multi-page applications from forms, dashboards, and workflows with configurable navigation.

## Key Exports

- `ApplicationStatus` — Type union: `'draft' | 'published'`
- `AppPage` — Interface for a single page/view in the application (id, label, icon, type, referenced item ID)
- `AppNavigation` — Interface for navigation settings (style: sidebar/tabs/top-bar, home page ID)
- `ApplicationDefinition` — Interface for the full application definition (id, name, pages, navigation, status, timestamps, resolved page data)

## Dependencies

- None (pure type definitions)

## How It Works

An `ApplicationDefinition` combines multiple pages (`AppPage[]`) each referencing a form, dashboard, or workflow by `itemId`. The `AppNavigation` object controls how users move between pages (sidebar, tabs, or top-bar style) and which page loads by default. The optional `resolvedPages` field carries pre-resolved page item data for shared/public views where lazy loading isn't available.
