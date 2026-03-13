import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { WorkflowService } from '../../services/workflow.service';
import { Workflow } from '../../config/workflow.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';

interface CalendarEvent {
  workflow: Workflow;
  time: string; // HH:MM
  stepCount: number;
}

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'app-workflow-calendar',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TranslatePipe,
    MatButtonModule, MatIconModule, MatTooltipModule, MatChipsModule,
  ],
  providers: [DatePipe],
  template: `
    <div class="cal-page">
      <!-- Header -->
      <div class="cal-header">
        <div class="page-title">
          <mat-icon class="title-icon">calendar_month</mat-icon>
          <div>
            <h1>{{ 'calendar.title' | t }}</h1>
            <p>{{ 'calendar.subtitle' | t }}</p>
          </div>
        </div>
        <div class="cal-nav">
          <button mat-icon-button (click)="prevMonth()" [matTooltip]="'calendar.prev-month' | t">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="cal-month-label">{{ monthLabel() }}</span>
          <button mat-icon-button (click)="nextMonth()" [matTooltip]="'calendar.next-month' | t">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <button mat-stroked-button (click)="goToday()" style="margin-left:8px">{{ 'calendar.today' | t }}</button>
        </div>
        <button mat-flat-button color="primary" routerLink="/workflows">
          <mat-icon>account_tree</mat-icon> Workflows
        </button>
      </div>

      <!-- Stats bar -->
      @if (totalScheduled() > 0) {
        <div class="cal-stats">
          <mat-icon>schedule</mat-icon>
          <span>{{ 'calendar.scheduled-count' | t:{count: totalScheduled()} }}</span>
        </div>
      } @else {
        <div class="cal-stats empty">
          <mat-icon>event_busy</mat-icon>
          <span>{{ 'calendar.no-scheduled' | t }}</span>
        </div>
      }

      <!-- Weekday headers -->
      <div class="cal-grid">
        @for (d of weekdays; track d) {
          <div class="cal-weekday">{{ d }}</div>
        }

        <!-- Day cells -->
        @for (day of calendarDays(); track day.date.toISOString()) {
          <div class="cal-cell"
               [class.other-month]="!day.inMonth"
               [class.today]="day.isToday"
               [class.has-events]="day.events.length > 0">
            <div class="cal-day-num">{{ day.date.getDate() }}</div>

            @for (evt of day.events; track evt.workflow.id) {
              <div class="cal-event"
                   [matTooltip]="evt.workflow.name + ' — ' + evt.stepCount + ' step(s)'"
                   (click)="openWorkflow(evt.workflow.id)">
                <mat-icon class="evt-icon">account_tree</mat-icon>
                <div class="evt-body">
                  <div class="evt-time">{{ evt.time }}</div>
                  <div class="evt-label">{{ evt.workflow.name }}</div>
                  <div class="evt-wf">{{ evt.stepCount }} step{{ evt.stepCount !== 1 ? 's' : '' }}</div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .cal-page { padding: 24px; }

    .cal-header {
      display: flex; align-items: center; gap: 16px;
      flex-wrap: wrap; margin-bottom: 16px;
    }
    .cal-header .page-title { display: flex; align-items: center; gap: 12px; flex: 1; }
    .cal-header .page-title h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
    .cal-header .page-title p { margin: 2px 0 0; font-size: 0.85rem; color: #666; }
    .title-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #1976d2; }

    .cal-nav {
      display: flex; align-items: center; gap: 4px;
    }
    .cal-month-label {
      font-size: 1.1rem; font-weight: 600; min-width: 160px; text-align: center;
    }

    .cal-stats {
      display: flex; align-items: center; gap: 8px;
      background: #e3f2fd; border-radius: 8px; padding: 10px 16px;
      margin-bottom: 16px; font-size: 0.9rem; color: #1565c0;
    }
    .cal-stats.empty { background: #f5f5f5; color: #888; }
    .cal-stats mat-icon { font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }

    /* Calendar grid: 7 columns */
    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }

    .cal-weekday {
      background: #1976d2; color: #fff;
      text-align: center; padding: 8px 0;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.05em;
    }

    .cal-cell {
      min-height: 110px; padding: 6px; border: 1px solid #eeeeee;
      background: #fff; cursor: default;
      transition: background 0.15s;
    }
    .cal-cell.other-month { background: #fafafa; }
    .cal-cell.other-month .cal-day-num { color: #bdbdbd; }
    .cal-cell.today { background: #e8f5e9; }
    .cal-cell.today .cal-day-num {
      background: #1976d2; color: #fff;
      border-radius: 50%; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
    }
    .cal-cell.has-events { background: linear-gradient(135deg, #fff 85%, #e3f2fd 100%); }
    .cal-cell.today.has-events { background: linear-gradient(135deg, #e8f5e9 85%, #bbdefb 100%); }

    .cal-day-num {
      font-size: 0.82rem; font-weight: 600; color: #444;
      margin-bottom: 4px; width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
    }

    .cal-event {
      display: flex; align-items: flex-start; gap: 4px;
      background: #1976d2; color: #fff;
      border-radius: 5px; padding: 3px 5px; margin-bottom: 3px;
      cursor: pointer; font-size: 0.72rem; line-height: 1.3;
      transition: background 0.15s; overflow: hidden;
    }
    .cal-event:hover { background: #1565c0; }
    .evt-icon { font-size: 0.85rem; width: 0.85rem; height: 0.85rem; margin-top: 2px; flex-shrink: 0; }
    .evt-body { overflow: hidden; }
    .evt-time { font-weight: 700; font-size: 0.68rem; opacity: 0.85; }
    .evt-label { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
    .evt-wf { opacity: 0.75; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  `],
})
export class WorkflowCalendarComponent {
  private readonly svc = inject(WorkflowService);
  private readonly router = inject(Router);
  readonly i18n = inject(TranslateService);

  readonly weekdays = WEEKDAYS;

  /** Active month: year + month (0-indexed) */
  private readonly _year  = signal(new Date().getFullYear());
  private readonly _month = signal(new Date().getMonth());

  readonly monthLabel = computed(() => {
    const d = new Date(this._year(), this._month(), 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  /** All scheduled workflows, indexed by "YYYY-MM-DD" */
  private readonly eventsByDay = computed<Map<string, CalendarEvent[]>>(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const wf of this.svc.workflows()) {
      if (!wf.scheduledAt) continue;
      const d = new Date(wf.scheduledAt);
      const key = this._dateKey(d);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const evt: CalendarEvent = {
        workflow: wf,
        time: `${hh}:${mm}`,
        stepCount: wf.steps.length,
      };
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(evt);
    }
    // Sort events within each day by time
    for (const events of map.values()) {
      events.sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const year  = this._year();
    const month = this._month();
    const today = new Date();
    const todayKey = this._dateKey(today);

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    // Pad before: days from previous month to fill the first row
    const days: CalendarDay[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month, -(firstDay.getDay() - 1) + i);
      days.push(this._makeDay(d, false, todayKey));
    }
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push(this._makeDay(d, true, todayKey));
    }
    // Pad after: days from next month to complete last row
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push(this._makeDay(d, false, todayKey));
      }
    }
    return days;
  });

  readonly totalScheduled = computed(() => {
    const year  = this._year();
    const month = this._month();
    let count = 0;
    for (const [key, evts] of this.eventsByDay()) {
      // Parse key parts directly to avoid "YYYY-MM-DD" being treated as UTC midnight
      const [kyear, kmonth] = key.split('-').map(Number);
      if (kyear === year && kmonth - 1 === month) count += evts.length;
    }
    return count;
  });

  prevMonth() {
    if (this._month() === 0) {
      this._month.set(11);
      this._year.update(y => y - 1);
    } else {
      this._month.update(m => m - 1);
    }
  }

  nextMonth() {
    if (this._month() === 11) {
      this._month.set(0);
      this._year.update(y => y + 1);
    } else {
      this._month.update(m => m + 1);
    }
  }

  goToday() {
    const now = new Date();
    this._year.set(now.getFullYear());
    this._month.set(now.getMonth());
  }

  openWorkflow(id: string) {
    this.router.navigate(['/workflows', id, 'edit']);
  }

  private _dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private _makeDay(d: Date, inMonth: boolean, todayKey: string): CalendarDay {
    const key = this._dateKey(d);
    return {
      date: d,
      inMonth,
      isToday: key === todayKey,
      events: this.eventsByDay().get(key) ?? [],
    };
  }
}
