import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';
import { FormDefinition, FormField, FormStatus } from '../config/form.types';

@Injectable({ providedIn: 'root' })
export class FormService {
  private readonly api = inject(ApiService);
  private readonly userMgmt = inject(UserManagementService);
  private readonly API_PREFIX = '/forms';

  private readonly _forms = signal<FormDefinition[]>([]);
  readonly forms = this._forms.asReadonly();

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
      const apiForms = (res as Record<string, unknown>[]).map(d => this.mapFromApi(d));
      if (apiForms.length > 0) {
        this._forms.set(apiForms);
      }
    } catch (err) {
      console.warn('Failed to load forms from API', err);
    }
  }

  private async createOnApi(form: FormDefinition): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    try {
      await firstValueFrom(
        this.api.post(this.API_PREFIX, '', {}, {
          id: form.id,
          userEmail: email,
          name: form.name,
          description: form.description ?? '',
          fields: form.fields,
          submitActions: form.submitActions,
          status: form.status,
        })
      );
    } catch (err) {
      console.warn('Failed to create form on API', err);
    }
  }

  private async updateOnApi(form: FormDefinition): Promise<void> {
    try {
      await firstValueFrom(
        this.api.put(this.API_PREFIX, '/:id', { id: form.id }, {
          name: form.name,
          description: form.description ?? '',
          fields: form.fields,
          submitActions: form.submitActions,
          status: form.status,
        })
      );
    } catch (err) {
      console.warn('Failed to update form on API', err);
    }
  }

  private async deleteFromApi(id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.api.delete(this.API_PREFIX, '/:id', { id })
      );
    } catch (err) {
      console.warn('Failed to delete form from API', err);
    }
  }

  private mapFromApi(dto: Record<string, unknown>): FormDefinition {
    return {
      id: dto['id'] as string,
      name: dto['name'] as string,
      description: (dto['description'] as string) || undefined,
      fields: (dto['fields'] ?? []) as FormField[],
      submitActions: (dto['submitActions'] ?? []) as FormDefinition['submitActions'],
      status: (dto['status'] as FormStatus) ?? 'draft',
      createdAt: dto['createdAt'] as string,
      updatedAt: dto['updatedAt'] as string,
    };
  }

  // ── Local state management ──────────────────────────────────────────────────

  upsert(form: FormDefinition): void {
    const isNew = !this._forms().some(f => f.id === form.id);
    this._forms.update(fs => {
      const idx = fs.findIndex(f => f.id === form.id);
      return idx >= 0
        ? fs.map(f => f.id === form.id ? form : f)
        : [...fs, form];
    });
    if (isNew) { this.createOnApi(form); } else { this.updateOnApi(form); }
  }

  remove(id: string): void {
    this._forms.update(fs => fs.filter(f => f.id !== id));
    this.deleteFromApi(id);
  }

  getById(id: string): FormDefinition | undefined {
    return this._forms().find(f => f.id === id);
  }

  /** Resolve a dot-notation path in an object */
  getPath(obj: unknown, path: string): unknown {
    if (!path) return obj;
    const parts = path.replaceAll(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.').filter(Boolean);
    let cur = obj;
    for (const part of parts) {
      if (cur == null || typeof cur !== 'object') return undefined;
      cur = (cur as Record<string, unknown>)[part];
    }
    return cur;
  }
}
