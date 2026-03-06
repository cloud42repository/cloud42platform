import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EndpointDef, ModuleDef, MODULE_MAP } from '../../config/endpoints';
import { ListViewComponent } from '../../shared/list-view/list-view.component';
import { FormViewComponent } from '../../shared/form-view/form-view.component';

@Component({
  selector: 'app-module-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule, MatDividerModule, MatButtonModule, MatTooltipModule,
    ListViewComponent, FormViewComponent,
  ],
  template: `
    @if (module()) {
      <!-- Module header -->
      <div class="module-header">
        <div class="module-icon-wrap">
          <mat-icon class="module-icon">{{ module()!.icon }}</mat-icon>
        </div>
        <div>
          <h1>{{ module()!.label }}</h1>
          <p class="module-subtitle">{{ module()!.apiPrefix }}</p>
        </div>
      </div>

      <div class="page-layout">
        <!-- Left: endpoint navigation -->
        <nav class="endpoint-nav">

          @if (getEndpoints().length > 0) {
            <div class="nav-section-label">
              <mat-icon class="section-icon">list</mat-icon> Views
            </div>
            @for (ep of getEndpoints(); track ep.id) {
              <button class="ep-btn"
                      [class.ep-btn--active]="selectedEndpoint()?.id === ep.id"
                      (click)="select(ep)"
                      [matTooltip]="ep.pathTemplate"
                      matTooltipPosition="right">
                <span class="method-badge method-get">GET</span>
                <span class="ep-label">{{ ep.label }}</span>
              </button>
            }
          }

          @if (getEndpoints().length > 0 && mutateEndpoints().length > 0) {
            <mat-divider class="nav-divider" />
          }

          @if (mutateEndpoints().length > 0) {
            <div class="nav-section-label">
              <mat-icon class="section-icon">edit</mat-icon> Actions
            </div>
            @for (ep of mutateEndpoints(); track ep.id) {
              <button class="ep-btn"
                      [class.ep-btn--active]="selectedEndpoint()?.id === ep.id"
                      (click)="select(ep)"
                      [matTooltip]="ep.pathTemplate"
                      matTooltipPosition="right">
                <span class="method-badge" [ngClass]="'method-' + ep.method.toLowerCase()">
                  {{ ep.method }}
                </span>
                <span class="ep-label">{{ ep.label }}</span>
              </button>
            }
          }

        </nav>

        <!-- Right: active endpoint view -->
        <div class="endpoint-content">
          @if (selectedEndpoint()) {
            @if (selectedEndpoint()!.method === 'GET') {
              <app-list-view
                [endpoint]="selectedEndpoint()!"
                [apiPrefix]="module()!.apiPrefix"
                [actionEndpoints]="getListActionEndpoints(selectedEndpoint())"
                [idMapping]="getIdMapping(selectedEndpoint())" />
            } @else {
              <app-form-view
                [endpoint]="selectedEndpoint()!"
                [apiPrefix]="module()!.apiPrefix" />
            }
          } @else {
            <div class="empty-msg">Select an endpoint from the left panel.</div>
          }
        </div>
      </div>

    } @else {
      <div class="empty-msg">Module not found.</div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }

    /* ── Module header ── */
    .module-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 4px 0 16px;
      border-bottom: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, #0284c7, #06b6d4) border-box;
      margin-bottom: 0;
    }
    .module-icon-wrap {
      display: flex; align-items: center; justify-content: center;
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #0284c7, #0ea5e9);
      box-shadow: 0 4px 12px rgba(2,132,199,.35);
      flex-shrink: 0;
    }
    .module-icon { font-size: 24px; width: 24px; height: 24px; color: #fff !important; }
    h1 { margin: 0; font-size: 20px; font-weight: 700; color: #1e293b; letter-spacing: -.02em; }
    .module-subtitle { margin: 2px 0 0; font-size: 12px; color: #64748b; font-family: monospace; }

    /* ── Two-panel layout ── */
    .page-layout {
      display: flex;
      gap: 0;
      height: calc(100vh - 152px);
      overflow: hidden;
      margin-top: 16px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.06);
      border: 1px solid #e2e8f0;
      background: #fff;
    }

    /* ── Left nav ── */
    .endpoint-nav {
      width: 234px; min-width: 234px;
      overflow-y: auto; overflow-x: hidden;
      border-right: 1px solid #e2e8f0;
      padding: 10px 0;
      background: #fafbff;
    }
    .nav-section-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .8px; color: #94a3b8;
      padding: 10px 14px 5px;
    }
    .section-icon { font-size: 13px; width: 13px; height: 13px; }
    .nav-divider { margin: 6px 14px; border-color: #e2e8f0; }

    .ep-btn {
      display: flex; align-items: center; gap: 8px;
      width: calc(100% - 16px); margin: 1px 8px;
      text-align: left;
      background: none; border: none; cursor: pointer;
      padding: 7px 10px; border-radius: 8px;
      transition: background .14s, color .14s;
      font-size: 12.5px; line-height: 1.3; color: #374151;
      font-family: inherit;
    }
    .ep-btn:hover { background: rgba(2,132,199,.07); color: #0284c7; }
    .ep-btn--active {
      background: rgba(2,132,199,.1) !important;
      color: #0369a1 !important;
      font-weight: 600;
    }
    .ep-btn--active .method-badge { box-shadow: 0 2px 8px rgba(0,0,0,.18); }
    .ep-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }

    /* ── Method pill badges ── */
    .method-badge {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 6px;
      padding: 2px 6px; font-size: 9px; font-weight: 800;
      letter-spacing: .5px; color: #fff;
      min-width: 46px; flex-shrink: 0;
      text-transform: uppercase;
    }
    .method-get    { background: #059669; }
    .method-post   { background: #0284c7; }
    .method-put    { background: #d97706; }
    .method-patch  { background: #7c3aed; }
    .method-delete { background: #dc2626; }

    /* ── Right content panel ── */
    .endpoint-content {
      flex: 1; overflow-y: auto; padding: 20px 24px;
      background: #fff;
    }
    .empty-msg {
      display: flex; align-items: center; justify-content: center;
      height: 100%;
      color: #94a3b8; font-style: italic; font-size: 14px;
    }
  `]
})
export class ModulePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  module = signal<ModuleDef | null>(null);
  getEndpoints = signal<EndpointDef[]>([]);
  mutateEndpoints = signal<EndpointDef[]>([]);
  selectedEndpoint = signal<EndpointDef | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.data['moduleId'] as string;
    const mod = MODULE_MAP.get(id) ?? null;
    this.module.set(mod);
    if (mod) {
      const gets = mod.endpoints.filter(e => e.method === 'GET');
      const muts = mod.endpoints.filter(e => e.method !== 'GET');
      this.getEndpoints.set(gets);
      this.mutateEndpoints.set(muts);
      // Auto-select first endpoint
      this.selectedEndpoint.set(gets[0] ?? muts[0] ?? null);
    }
  }

  getListActionEndpoints(ep: EndpointDef | null): EndpointDef[] {
    if (!ep || !this.module()) return [];
    const actionMap: Record<string, string[]> = {
      'list-storage-accounts': ['patch-storage-account', 'delete-storage-account'],
      'list-partner-storage-accounts': ['patch-partner-storage-account', 'delete-partner-storage-account'],
    };
    const actionIds = actionMap[ep.id] ?? [];
    return this.module()!.endpoints.filter(e => actionIds.includes(e.id));
  }

  getIdMapping(ep: EndpointDef | null): Record<string, string> {
    if (!ep) return {};
    const mappings: Record<string, Record<string, string>> = {
      'list-storage-accounts': { clientAccountId: 'accountId' },
      'list-partner-storage-accounts': { clientAccountId: 'accountId' },
    };
    return mappings[ep.id] ?? {};
  }

  select(ep: EndpointDef) {
    this.selectedEndpoint.set(ep);
  }
}
