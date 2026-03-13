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
import { MatBadgeModule } from '@angular/material/badge';

import { MODULES, ModuleDef } from '../../config/endpoints';
import {
  AuthType, AuthConfig,
  AUTH_TYPE_LABELS, AUTH_TYPE_FIELDS, AUTH_FIELD_LABELS,
} from '../../config/auth-config.types';
import { AuthConfigService } from '../../services/auth-config.service';
import { ModuleVisibilityService } from '../../services/module-visibility.service';
import { UserManagementService } from '../../services/user-management.service';
import { UserRole, USER_ROLE_LABELS, StoredUser } from '../../config/user.types';
import { TranslatePipe } from '../../i18n/translate.pipe';

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
    MatSlideToggleModule, MatBadgeModule, TranslatePipe,
  ],
  template: `
    <div class="settings-root">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-left">
          <mat-icon class="page-header-icon">settings</mat-icon>
          <div>
            <h1 class="page-title">{{ 'settings.title' | t }}</h1>
            <p class="page-subtitle">{{ 'settings.subtitle' | t }}</p>
          </div>
        </div>
        <button mat-flat-button color="primary" (click)="saveAll()" [disabled]="!hasAnyDirty()">
          <mat-icon>save</mat-icon>
          {{ 'settings.save-all' | t }}
        </button>
      </div>

      <mat-tab-group animationDuration="200ms" class="settings-tabs">

        <!-- ─────────── Tab: API Authentication ─────────── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">lock</mat-icon>
            {{ 'settings.tab-auth' | t }}
          </ng-template>

          <div class="auth-section">
            <p class="section-hint">
              {{ 'settings.auth-hint' | t }}
            </p>

            <!-- Summary chips -->
            <div class="summary-row">
              <span class="summary-label">{{ 'settings.configured' | t }}</span>
              @for (s of states; track s.module.id) {
                @if (s.config.type !== 'none') {
                  <span class="summary-chip" [style.background]="moduleColor(s.module.id)">
                    <mat-icon class="chip-icon">{{ s.module.icon }}</mat-icon>
                    {{ s.module.label }}
                  </span>
                }
              }
              @if (configuredCount() === 0) {
                <span class="summary-empty">{{ 'settings.none-yet' | t }}</span>
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
                        {{ 'settings.clear' | t }}
                      </button>
                      <button mat-flat-button color="primary" (click)="saveOne(state)" [disabled]="!state.dirty">
                        <mat-icon>save</mat-icon>
                        {{ 'settings.save' | t }}
                      </button>
                    </div>
                  </div>
                </mat-expansion-panel>
              }
            </mat-accordion>
          </div>
        </mat-tab>

        <!-- ─────────── Tab: General (Module Visibility) ─────────── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">tune</mat-icon>
            {{ 'settings.tab-general' | t }}
          </ng-template>
          <div class="general-section">
            <h2 class="section-title">{{ 'settings.module-visibility' | t }}</h2>
            <p class="section-hint">
              Enable or disable API modules in the sidebar navigation.
              Disabled modules are hidden from the menu but their configuration is preserved.
            </p>
            @if (!userMgmt.canEditModules()) {
              <div class="role-notice">
                <mat-icon>info</mat-icon>
                <span>Your role (<strong>{{ roleLabel(userMgmt.currentRole()) }}</strong>) does not allow editing module visibility. Contact an Admin.</span>
              </div>
            }
            @if (userMgmt.canEditModules()) {
              <div class="toggle-actions">
                <button mat-stroked-button (click)="enableAllModules()">
                  <mat-icon>check_box</mat-icon> {{ 'settings.enable-all' | t }}
                </button>
                <button mat-stroked-button (click)="disableAllModules()">
                  <mat-icon>check_box_outline_blank</mat-icon> {{ 'settings.disable-all' | t }}
                </button>
                <span class="toggle-count">{{ enabledCount() }} / {{ allModules.length }} enabled</span>
              </div>
            }
            <div class="toggle-list">
              @for (mod of allModules; track mod.id) {
                <div class="toggle-row">
                  <mat-icon class="toggle-module-icon" [style.color]="moduleColor(mod.id)">{{ mod.icon }}</mat-icon>
                  <span class="toggle-module-label">{{ mod.label }}</span>
                  <mat-slide-toggle
                    [checked]="visibility.isEnabled(mod.id)"
                    (change)="visibility.setEnabled(mod.id, $event.checked)"
                    [disabled]="!userMgmt.canEditModules()"
                    color="primary" />
                </div>
              }
            </div>
          </div>
        </mat-tab>

        <!-- ─────────── Tab: User Management (Admin only) ─────────── -->
        @if (userMgmt.isAdmin()) {
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon class="tab-icon">group</mat-icon>
              {{ 'settings.tab-users' | t }}
            </ng-template>
            <div class="general-section">
              <h2 class="section-title">{{ 'users.title' | t }}</h2>
              <p class="section-hint">
                Manage platform users, assign roles, and configure per-user module access.
                Users are registered automatically on their first Google sign-in.
              </p>

              <div class="users-list">
                @for (u of userMgmt.users(); track u.email) {
                  <mat-expansion-panel class="user-panel">
                    <mat-expansion-panel-header>
                      <mat-panel-title class="user-panel-title">
                        @if (u.photoUrl) {
                          <img [src]="u.photoUrl" class="user-avatar-sm" alt="" />
                        } @else {
                          <mat-icon class="user-avatar-icon">account_circle</mat-icon>
                        }
                        <div class="user-info-col">
                          <span class="user-name-text">{{ u.name || u.email }}</span>
                          <span class="user-email-text">{{ u.email }}</span>
                        </div>
                      </mat-panel-title>
                      <mat-panel-description class="user-panel-desc">
                        <span class="badge" [class]="'badge-role-' + u.role">{{ roleLabel(u.role) }}</span>
                      </mat-panel-description>
                    </mat-expansion-panel-header>

                    <!-- User detail content -->
                    <div class="user-detail">
                      <div class="user-meta">
                        <span><strong>First login:</strong> {{ u.createdAt | date:'medium' }}</span>
                        <span><strong>Last login:</strong> {{ u.lastLoginAt | date:'medium' }}</span>
                      </div>

                      <!-- Role selector -->
                      <mat-form-field appearance="outline" class="role-select">
                        <mat-label>Role</mat-label>
                        <mat-select [value]="u.role" (selectionChange)="changeRole(u.email, $event.value)">
                          @for (r of roleOptions; track r.value) {
                            <mat-option [value]="r.value">{{ r.label }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>

                      <!-- Per-user module toggles -->
                      <h3 class="user-modules-title">Module Access</h3>
                      <div class="toggle-actions">
                        <button mat-stroked-button (click)="enableAllForUser(u.email)">
                          <mat-icon>check_box</mat-icon> {{ 'settings.enable-all' | t }}
                        </button>
                        <button mat-stroked-button (click)="disableAllForUser(u.email)">
                          <mat-icon>check_box_outline_blank</mat-icon> {{ 'settings.disable-all' | t }}
                        </button>
                        <span class="toggle-count">{{ userEnabledCount(u) }} / {{ allModules.length }}</span>
                      </div>
                      <div class="toggle-list">
                        @for (mod of allModules; track mod.id) {
                          <div class="toggle-row">
                            <mat-icon class="toggle-module-icon" [style.color]="moduleColor(mod.id)">{{ mod.icon }}</mat-icon>
                            <span class="toggle-module-label">{{ mod.label }}</span>
                            <mat-slide-toggle
                              [checked]="isUserModuleEnabled(u, mod.id)"
                              (change)="userMgmt.setModuleEnabled(u.email, mod.id, $event.checked)"
                              color="primary" />
                          </div>
                        }
                      </div>

                      <!-- remove user (cannot remove yourself) -->
                      @if (u.email !== userMgmt.currentUser()?.email) {
                        <div class="panel-actions">
                          <button mat-stroked-button color="warn" (click)="removeUser(u.email, u.name)">
                            <mat-icon>person_remove</mat-icon> {{ 'users.remove' | t }}
                          </button>
                        </div>
                      }
                    </div>
                  </mat-expansion-panel>
                }
              </div>
              @if (userMgmt.users().length === 0) {
                <p class="summary-empty">{{ 'users.no-users' | t }}</p>
              }
            </div>
          </mat-tab>
        }

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

    /* ── Role notice ── */
    .role-notice {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #9a3412;
    }

    /* ── User Management ── */
    .users-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .user-panel {
      border-radius: 8px !important;
    }
    .user-panel-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    .user-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }
    .user-avatar-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #94a3b8;
    }
    .user-info-col {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .user-name-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: #0f172a;
    }
    .user-email-text {
      font-size: 0.75rem;
      color: #64748b;
    }
    .user-panel-desc {
      display: flex;
      align-items: center;
    }
    .badge-role-admin {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-role-manager {
      background: #fef3c7;
      color: #b45309;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-role-user {
      background: #f1f5f9;
      color: #475569;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .user-detail {
      padding: 8px 0 4px;
    }
    .user-meta {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;
      font-size: 0.82rem;
      color: #64748b;
    }
    .role-select {
      width: 220px;
      margin-bottom: 8px;
    }
    .user-modules-title {
      margin: 16px 0 8px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
    }
  `],
})
export class SettingsComponent implements OnInit {
  private readonly svc = inject(AuthConfigService);
  private readonly snack = inject(MatSnackBar);
  readonly visibility = inject(ModuleVisibilityService);
  readonly userMgmt = inject(UserManagementService);

  readonly allModules = MODULES;
  states: ModuleAuthState[] = [];

  readonly authTypeOptions = Object.entries(AUTH_TYPE_LABELS).map(([value, label]) => ({
    value: value as AuthType,
    label,
  }));

  readonly roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
  ];

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

  /* ── User Management helpers (admin) ── */

  roleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] ?? role;
  }

  changeRole(email: string, role: UserRole): void {
    this.userMgmt.setRole(email, role);
    this.snack.open(`✓ Role updated to ${USER_ROLE_LABELS[role]}`, '', { duration: 2500 });
  }

  removeUser(email: string, name: string): void {
    if (!confirm(`Remove user "${name || email}" from the platform?`)) return;
    this.userMgmt.removeUser(email);
    this.snack.open(`✓ User removed`, '', { duration: 2500 });
  }

  isUserModuleEnabled(user: StoredUser, moduleId: string): boolean {
    const defaultEnabled = user.role === 'admin' || user.role === 'manager';
    return user.moduleVisibility[moduleId] ?? defaultEnabled;
  }

  userEnabledCount(user: StoredUser): number {
    return this.allModules.filter(m => this.isUserModuleEnabled(user, m.id)).length;
  }

  enableAllForUser(email: string): void {
    this.userMgmt.setAllModulesEnabled(email, this.allModules.map(m => m.id), true);
    this.snack.open('✓ All modules enabled for user', '', { duration: 2000 });
  }

  disableAllForUser(email: string): void {
    this.userMgmt.setAllModulesEnabled(email, this.allModules.map(m => m.id), false);
    this.snack.open('✓ All modules disabled for user', '', { duration: 2000 });
  }
}
