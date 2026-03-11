import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MODULES, ModuleDef } from '../../config/endpoints';
import {
  AuthType, AuthConfig,
  AUTH_TYPE_LABELS, AUTH_TYPE_FIELDS, AUTH_FIELD_LABELS,
} from '../../config/auth-config.types';
import { AuthConfigService } from '../../services/auth-config.service';
import { ModuleVisibilityService } from '../../services/module-visibility.service';

interface ModuleAuthState {
  module: ModuleDef;
  config: AuthConfig;
  showSecrets: Record<string, boolean>;
  dirty: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatExpansionModule, MatSelectModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatCardModule,
    MatTooltipModule, MatDividerModule, MatSnackBarModule, MatTabsModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="settings-root">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-left">
          <mat-icon class="page-header-icon">settings</mat-icon>
          <div>
            <h1 class="page-title">Settings</h1>
            <p class="page-subtitle">Configure authentication credentials for each API connector</p>
          </div>
        </div>
        <button mat-flat-button color="primary" (click)="saveAll()" [disabled]="!hasAnyDirty()">
          <mat-icon>save</mat-icon>
          Save All Changes
        </button>
      </div>

      <mat-tab-group animationDuration="200ms" class="settings-tabs">

        <!-- ─────────── Tab: API Authentication ─────────── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">lock</mat-icon>
            API Authentication
          </ng-template>

          <div class="auth-section">
            <p class="section-hint">
              Select an authentication method for each API and fill in the required credentials.
              Credentials are stored locally in your browser.
            </p>

            <!-- Summary chips -->
            <div class="summary-row">
              <span class="summary-label">Configured:</span>
              @for (s of states; track s.module.id) {
                @if (s.config.type !== 'none') {
                  <span class="summary-chip" [style.background]="moduleColor(s.module.id)">
                    <mat-icon class="chip-icon">{{ s.module.icon }}</mat-icon>
                    {{ s.module.label }}
                  </span>
                }
              }
              @if (configuredCount() === 0) {
                <span class="summary-empty">None yet</span>
              }
            </div>

            <!-- Expansion panel per module -->
            <mat-accordion multi>
              @for (state of states; track state.module.id) {
                <mat-expansion-panel class="module-panel" [class.panel-configured]="state.config.type !== 'none'">
                  <mat-expansion-panel-header>
                    <mat-panel-title class="panel-title">
                      <mat-icon class="module-icon">{{ state.module.icon }}</mat-icon>
                      <span>{{ state.module.label }}</span>
                    </mat-panel-title>
                    <mat-panel-description class="panel-desc">
                      @if (state.config.type === 'none') {
                        <span class="badge badge-none">Not configured</span>
                      } @else {
                        <span class="badge badge-ok">
                          <mat-icon class="badge-icon">check_circle</mat-icon>
                          {{ authTypeLabel(state.config.type) }}
                        </span>
                      }
                      @if (state.dirty) {
                        <span class="badge badge-dirty">Unsaved</span>
                      }
                    </mat-panel-description>
                  </mat-expansion-panel-header>

                  <!-- Panel content -->
                  <div class="panel-body">

                    <!-- Auth type selector -->
                    <mat-form-field appearance="outline" class="field-wide">
                      <mat-label>Authentication Type</mat-label>
                      <mat-select
                        [(ngModel)]="state.config.type"
                        (ngModelChange)="onTypeChange(state)">
                        @for (opt of authTypeOptions; track opt.value) {
                          <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <!-- Dynamic fields -->
                    @if (state.config.type !== 'none') {
                      <div class="fields-grid">
                        @for (field of fieldsFor(state.config.type); track field) {
                          <mat-form-field appearance="outline" class="field-item">
                            <mat-label>{{ fieldMeta(field).label }}</mat-label>
                            <input
                              matInput
                              [type]="fieldInputType(field, state)"
                              [placeholder]="fieldMeta(field).placeholder || ''"
                              [(ngModel)]="$any(state.config)[field]"
                              (ngModelChange)="state.dirty = true"
                            />
                            @if (fieldMeta(field).secret) {
                              <button mat-icon-button matSuffix
                                type="button"
                                (click)="toggleSecret(state, field)"
                                [matTooltip]="state.showSecrets[field] ? 'Hide' : 'Show'">
                                <mat-icon>{{ state.showSecrets[field] ? 'visibility_off' : 'visibility' }}</mat-icon>
                              </button>
                            }
                          </mat-form-field>
                        }
                      </div>
                    }

                    <!-- Panel actions -->
                    <div class="panel-actions">
                      <button mat-stroked-button color="warn" (click)="clearConfig(state)"
                        [disabled]="state.config.type === 'none' && !state.dirty">
                        <mat-icon>delete_outline</mat-icon>
                        Clear
                      </button>
                      <button mat-flat-button color="primary" (click)="saveOne(state)" [disabled]="!state.dirty">
                        <mat-icon>save</mat-icon>
                        Save
                      </button>
                    </div>
                  </div>
                </mat-expansion-panel>
              }
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- ─────────── Tab: General ─────────── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">tune</mat-icon>
            General
          </ng-template>
          <div class="general-section">
            <h2 class="section-title">Menu Modules</h2>
            <p class="section-hint">
              Enable or disable API modules in the sidebar navigation.
              Disabled modules are hidden from the menu but their configuration is preserved.
            </p>
            <div class="toggle-actions">
              <button mat-stroked-button (click)="enableAllModules()">
                <mat-icon>check_box</mat-icon> Enable All
              </button>
              <button mat-stroked-button (click)="disableAllModules()">
                <mat-icon>check_box_outline_blank</mat-icon> Disable All
              </button>
              <span class="toggle-count">{{ enabledCount() }} / {{ allModules.length }} enabled</span>
            </div>
            <div class="toggle-list">
              @for (mod of allModules; track mod.id) {
                <div class="toggle-row">
                  <mat-icon class="toggle-module-icon" [style.color]="moduleColor(mod.id)">{{ mod.icon }}</mat-icon>
                  <span class="toggle-module-label">{{ mod.label }}</span>
                  <mat-slide-toggle
                    [checked]="visibility.isEnabled(mod.id)"
                    (change)="visibility.setEnabled(mod.id, $event.checked)"
                    color="primary" />
                </div>
              }
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    .settings-root {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
    }
    .page-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .page-header-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #0284c7;
    }
    .page-title {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 600;
      color: #0f172a;
    }
    .page-subtitle {
      margin: 2px 0 0;
      font-size: 0.85rem;
      color: #64748b;
    }

    /* ── Tabs ── */
    .settings-tabs {
      background: transparent;
    }
    .tab-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 6px;
      vertical-align: middle;
    }

    /* ── Auth section ── */
    .auth-section {
      padding: 20px 0 0;
    }
    .section-hint {
      font-size: 0.85rem;
      color: #64748b;
      margin: 0 0 18px;
    }

    /* ── Summary chips ── */
    .summary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
    }
    .summary-label {
      font-size: 0.82rem;
      color: #94a3b8;
      font-weight: 500;
    }
    .summary-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px 3px 6px;
      border-radius: 12px;
      font-size: 0.78rem;
      font-weight: 500;
      color: #fff;
      opacity: 0.9;
    }
    .chip-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .summary-empty {
      font-size: 0.82rem;
      color: #cbd5e1;
      font-style: italic;
    }

    /* ── Accordion panels ── */
    .module-panel {
      margin-bottom: 8px;
      border-radius: 8px !important;
      border-left: 4px solid transparent;
      transition: border-color 0.2s;
    }
    .module-panel.panel-configured {
      border-left-color: #22c55e;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }
    .module-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #0284c7;
    }
    .panel-desc {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .badge-none {
      background: #f1f5f9;
      color: #94a3b8;
    }
    .badge-ok {
      background: #dcfce7;
      color: #16a34a;
    }
    .badge-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
    }
    .badge-dirty {
      background: #fef3c7;
      color: #b45309;
    }

    /* ── Panel body ── */
    .panel-body {
      padding: 8px 0 4px;
    }
    .field-wide {
      width: 100%;
      margin-bottom: 8px;
    }
    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    .field-item {
      width: 100%;
    }
    @media (max-width: 640px) {
      .fields-grid { grid-template-columns: 1fr; }
    }
    .panel-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }

    /* ── General tab ── */
    .general-section {
      padding: 20px 0 0;
    }
    .section-title {
      margin: 0 0 4px;
      font-size: 1.15rem;
      font-weight: 600;
      color: #0f172a;
    }
    .toggle-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;
    }
    .toggle-count {
      margin-left: auto;
      font-size: 0.82rem;
      color: #64748b;
      font-weight: 500;
    }
    .toggle-list {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s;
    }
    .toggle-row:last-child {
      border-bottom: none;
    }
    .toggle-row:hover {
      background: #f8fafc;
    }
    .toggle-module-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .toggle-module-label {
      flex: 1;
      font-size: 0.9rem;
      font-weight: 500;
      color: #1e293b;
    }
  `],
})
export class SettingsComponent implements OnInit {
  private readonly svc = inject(AuthConfigService);
  private readonly snack = inject(MatSnackBar);
  readonly visibility = inject(ModuleVisibilityService);

  readonly allModules = MODULES;
  states: ModuleAuthState[] = [];

  readonly authTypeOptions = Object.entries(AUTH_TYPE_LABELS).map(([value, label]) => ({
    value: value as AuthType,
    label,
  }));

  private readonly PALETTE = [
    '#0284c7', '#7c3aed', '#16a34a', '#dc2626', '#b45309',
    '#0891b2', '#9333ea', '#15803d', '#ea580c', '#4f46e5',
  ];

  ngOnInit(): void {
    this.states = MODULES.map((mod, i) => ({
      module: mod,
      config: { ...this.svc.getConfig(mod.id) },
      showSecrets: {},
      dirty: false,
    }));
  }

  configuredCount(): number {
    return this.states.filter(s => s.config.type !== 'none').length;
  }

  hasAnyDirty(): boolean {
    return this.states.some(s => s.dirty);
  }

  moduleColor(id: string): string {
    const idx = MODULES.findIndex(m => m.id === id);
    return this.PALETTE[idx % this.PALETTE.length];
  }

  authTypeLabel(type: AuthType): string {
    return AUTH_TYPE_LABELS[type] ?? type;
  }

  fieldsFor(type: AuthType): string[] {
    return AUTH_TYPE_FIELDS[type] ?? [];
  }

  fieldMeta(field: string) {
    return AUTH_FIELD_LABELS[field] ?? { label: field };
  }

  fieldInputType(field: string, state: ModuleAuthState): string {
    const meta = AUTH_FIELD_LABELS[field];
    if (meta?.secret && !state.showSecrets[field]) return 'password';
    return 'text';
  }

  toggleSecret(state: ModuleAuthState, field: string): void {
    state.showSecrets[field] = !state.showSecrets[field];
  }

  onTypeChange(state: ModuleAuthState): void {
    // Keep type but clear unrelated fields so old secrets don't linger
    const type = state.config.type;
    state.config = { type };
    state.showSecrets = {};
    state.dirty = true;
  }

  saveOne(state: ModuleAuthState): void {
    this.svc.saveConfig(state.module.id, { ...state.config });
    state.dirty = false;
    this.snack.open(`✓ ${state.module.label} auth saved`, '', { duration: 2500 });
  }

  saveAll(): void {
    let count = 0;
    for (const s of this.states) {
      if (s.dirty) {
        this.svc.saveConfig(s.module.id, { ...s.config });
        s.dirty = false;
        count++;
      }
    }
    this.snack.open(`✓ Saved ${count} auth configuration${count !== 1 ? 's' : ''}`, '', { duration: 3000 });
  }

  clearConfig(state: ModuleAuthState): void {
    state.config = { type: 'none' };
    state.showSecrets = {};
    state.dirty = true;
  }

  /* ── General tab helpers ── */
  enabledCount(): number {
    return this.allModules.filter(m => this.visibility.isEnabled(m.id)).length;
  }

  enableAllModules(): void {
    this.visibility.enableAll();
    this.snack.open('✓ All modules enabled', '', { duration: 2000 });
  }

  disableAllModules(): void {
    this.visibility.disableAll();
    this.snack.open('✓ All modules disabled', '', { duration: 2000 });
  }
}
