# workflow-calendar.component.ts

This component provides a monthly calendar view of scheduled workflows. It displays a traditional 7-column grid calendar with workflow events placed on their scheduled dates, allowing users to visualize and navigate to scheduled workflow executions.

## Key Exports

- **WorkflowCalendarComponent** — Standalone Angular component rendering a navigable monthly calendar with workflow events.
- **CalendarEvent** (interface) — Represents a single workflow occurrence on a day (workflow ref, time string, step count).
- **CalendarDay** (interface) — Represents a calendar cell (date, inMonth flag, isToday flag, events array).

## Template

- **Header** — Title with calendar icon, month navigation (prev/next/today buttons), current month label, and a link back to the workflows list.
- **Stats Bar** — Shows count of scheduled workflows in the current month, or an empty state message.
- **Weekday Headers** — Sun–Sat column headers.
- **Calendar Grid** — 7-column CSS grid of day cells, each showing:
  - Day number (highlighted for today)
  - Workflow events as colored cards with time, name, and step count
  - Visual distinctions for current month vs. adjacent month days

## Dependencies

- `@angular/core` (Component, inject, signal, computed)
- `@angular/common` (CommonModule, DatePipe)
- `@angular/router` (Router, RouterLink)
- Angular Material (Button, Icon, Tooltip, Chips)
- `WorkflowService` — Provides reactive `workflows()` signal
- `Workflow` type from `workflow.types`
- `TranslatePipe` / `TranslateService` — i18n

## How It Works

The component tracks the active month/year via signals. A computed `eventsByDay` maps all workflows with a `scheduledAt` date into a `Map<string, CalendarEvent[]>` keyed by `"YYYY-MM-DD"`. The `calendarDays` computed generates the full grid (padding from previous/next months to fill complete weeks), attaching events from the map to each day. Navigation methods (`prevMonth`, `nextMonth`, `goToday`) update the year/month signals, which reactively recompute the calendar. Clicking an event navigates to the workflow editor via `router.navigate()`. The `totalScheduled` computed counts events in the current month for the stats bar.
