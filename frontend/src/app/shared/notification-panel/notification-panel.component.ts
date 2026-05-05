import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../config/notification.types';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule, MatBadgeModule,
    MatMenuModule, MatTooltipModule, MatDividerModule,
  ],
  template: `
    <button mat-icon-button
            [matMenuTriggerFor]="notifMenu"
            matTooltip="Notifications"
            style="color:white"
            (menuOpened)="onMenuOpen()">
      <mat-icon [matBadge]="svc.unreadCount() > 0 ? svc.unreadCount() : null"
                matBadgeColor="warn"
                matBadgeSize="small">
        notifications
      </mat-icon>
    </button>

    <mat-menu #notifMenu="matMenu" xPosition="before" class="notification-menu">
      <div class="notif-header" (click)="$event.stopPropagation()">
        <span class="notif-title">Notifications</span>
        @if (svc.unreadCount() > 0) {
          <button mat-button class="mark-all-btn" (click)="svc.markAllRead()">Mark all read</button>
        }
      </div>
      <mat-divider />
      @if (svc.notifications().length === 0) {
        <div class="notif-empty" (click)="$event.stopPropagation()">
          <mat-icon>notifications_none</mat-icon>
          <span>No notifications</span>
        </div>
      }
      @for (n of svc.notifications().slice(0, 20); track n.id) {
        <div class="notif-item" [class.notif-unread]="!n.read" (click)="onItemClick(n)">
          <mat-icon class="notif-type-icon" [class]="'notif-icon-' + n.type">
            {{ getIcon(n.type) }}
          </mat-icon>
          <div class="notif-content">
            <span class="notif-item-title">{{ n.title }}</span>
            @if (n.message) {
              <span class="notif-item-message">{{ n.message }}</span>
            }
            <span class="notif-item-time">{{ formatTime(n.createdAt) }}</span>
          </div>
          <button mat-icon-button class="notif-delete-btn" (click)="onDelete($event, n.id)" matTooltip="Delete">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
      @if (svc.notifications().length > 20) {
        <div class="notif-more" (click)="$event.stopPropagation()">
          +{{ svc.notifications().length - 20 }} more
        </div>
      }
    </mat-menu>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; }
    .notif-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; min-width: 320px; }
    .notif-title { font-weight: 500; font-size: 14px; }
    .mark-all-btn { font-size: 12px; }
    .notif-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 16px; color: var(--mat-sys-on-surface-variant); }
    .notif-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s; }
    .notif-item:hover { background: var(--mat-sys-surface-variant, rgba(0,0,0,0.04)); }
    .notif-unread { background: var(--mat-sys-primary-container, rgba(33,150,243,0.08)); }
    .notif-type-icon { margin-top: 2px; font-size: 20px; width: 20px; height: 20px; }
    .notif-icon-info { color: #2196f3; }
    .notif-icon-success { color: #4caf50; }
    .notif-icon-warning { color: #ff9800; }
    .notif-icon-error { color: #f44336; }
    .notif-content { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .notif-item-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-item-message { font-size: 12px; color: var(--mat-sys-on-surface-variant); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-item-time { font-size: 11px; color: var(--mat-sys-outline); margin-top: 2px; }
    .notif-delete-btn { width: 24px; height: 24px; line-height: 24px; }
    .notif-delete-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .notif-more { text-align: center; padding: 8px; font-size: 12px; color: var(--mat-sys-primary); }
  `],
})
export class NotificationPanelComponent {
  readonly svc = inject(NotificationService);

  onMenuOpen(): void {
    this.svc.load();
  }

  onItemClick(n: Notification): void {
    if (!n.read) {
      this.svc.markAsRead([n.id]);
    }
  }

  onDelete(event: Event, id: string): void {
    event.stopPropagation();
    this.svc.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  }
}
