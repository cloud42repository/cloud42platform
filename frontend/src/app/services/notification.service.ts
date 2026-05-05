import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';
import { Notification } from '../config/notification.types';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly userMgmt = inject(UserManagementService);
  private readonly API_PREFIX = '/notifications';

  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter(n => !n.read).length);
  readonly unread = computed(() => this._notifications().filter(n => !n.read));

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    queueMicrotask(() => this.startPolling());
  }

  private startPolling(): void {
    this.load();
    this.pollInterval = setInterval(() => this.load(), 30000);
  }

  async load(): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      const res = await firstValueFrom(
        this.api.get(this.API_PREFIX, '', {}, { userEmail: email })
      );
      this._notifications.set(res as Notification[]);
    } catch {
      // silent
    }
  }

  async addNotification(
    title: string,
    message = '',
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    metadata: Record<string, unknown> = {},
  ): Promise<Notification | null> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return null;
    try {
      const res = await firstValueFrom(
        this.api.post(this.API_PREFIX, '', {}, {
          userEmail: email,
          type,
          title,
          message,
          metadata,
        })
      );
      const notification = res as Notification;
      this._notifications.update(list => [notification, ...list]);
      return notification;
    } catch {
      return null;
    }
  }

  async markAsRead(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      await firstValueFrom(
        this.api.patch(this.API_PREFIX, '/read', {}, { ids })
      );
      this._notifications.update(list =>
        list.map(n => ids.includes(n.id) ? { ...n, read: true } : n)
      );
    } catch {
      // silent
    }
  }

  async markAllRead(): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      await firstValueFrom(
        this.api.patch(this.API_PREFIX, '/read-all', {}, { userEmail: email })
      );
      this._notifications.update(list => list.map(n => ({ ...n, read: true })));
    } catch {
      // silent
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.api.delete(this.API_PREFIX, '/:id', { id })
      );
      this._notifications.update(list => list.filter(n => n.id !== id));
    } catch {
      // silent
    }
  }

  async clearAll(): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      await firstValueFrom(
        this.api.delete(this.API_PREFIX, '', {}, { userEmail: email })
      );
      this._notifications.set([]);
    } catch {
      // silent
    }
  }

  destroy(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
