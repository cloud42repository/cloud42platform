import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';
import { ApplicationDefinition, AppPage, AppNavigation, ApplicationStatus } from '../config/application.types';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly api = inject(ApiService);
  private readonly userMgmt = inject(UserManagementService);
  private readonly API_PREFIX = '/applications';

  private readonly _apps = signal<ApplicationDefinition[]>([]);
  readonly apps = this._apps.asReadonly();

  constructor() {
    queueMicrotask(() => this.loadFromApi());
  }

  // ── Backend API ─────────────────────────────────────────────────────────────

  async loadFromApi(): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      const res = await firstValueFrom(
        this.api.get(this.API_PREFIX, '', {}, { userEmail: email })
      );
      const apiApps = (res as Record<string, unknown>[]).map(d => this.mapFromApi(d));
      if (apiApps.length > 0) {
        this._apps.set(apiApps);
      }
    } catch (err) {
      console.warn('Failed to load applications from API', err);
    }
  }

  private async createOnApi(app: ApplicationDefinition): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      await firstValueFrom(
        this.api.post(this.API_PREFIX, '', {}, {
          id: app.id,
          userEmail: email,
          name: app.name,
          description: app.description ?? '',
          pages: app.pages,
          navigation: app.navigation,
          status: app.status,
        })
      );
    } catch (err) {
      console.warn('Failed to create application on API', err);
    }
  }

  private async updateOnApi(app: ApplicationDefinition): Promise<void> {
    try {
      await firstValueFrom(
        this.api.put(this.API_PREFIX, '/:id', { id: app.id }, {
          name: app.name,
          description: app.description ?? '',
          pages: app.pages,
          navigation: app.navigation,
          status: app.status,
        })
      );
    } catch (err) {
      console.warn('Failed to update application on API', err);
    }
  }

  private async deleteFromApi(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.api.delete(this.API_PREFIX, '/:id', { id })
      );
    } catch (err) {
      console.warn('Failed to delete application from API', err);
    }
  }

  private mapFromApi(dto: Record<string, unknown>): ApplicationDefinition {
    return {
      id: dto['id'] as string,
      name: dto['name'] as string,
      description: (dto['description'] as string) || undefined,
      pages: (dto['pages'] ?? []) as AppPage[],
      navigation: (dto['navigation'] ?? { style: 'sidebar' }) as AppNavigation,
      status: (dto['status'] as ApplicationStatus) ?? 'draft',
      createdAt: dto['createdAt'] as string,
      updatedAt: dto['updatedAt'] as string,
    };
  }

  // ── Local state management ──────────────────────────────────────────────────

  upsert(app: ApplicationDefinition): void {
    const isNew = !this._apps().some(a => a.id === app.id);
    this._apps.update(as => {
      const idx = as.findIndex(a => a.id === app.id);
      return idx >= 0
        ? as.map(a => a.id === app.id ? app : a)
        : [...as, app];
    });
    if (isNew) { this.createOnApi(app); } else { this.updateOnApi(app); }
  }

  remove(id: string): void {
    this._apps.update(as => as.filter(a => a.id !== id));
    this.deleteFromApi(id);
  }

  getById(id: string): ApplicationDefinition | undefined {
    return this._apps().find(a => a.id === id);
  }
}
