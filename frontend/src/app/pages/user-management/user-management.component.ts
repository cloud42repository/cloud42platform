import { Component, OnInit, TemplateRef, inject, signal, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { UserApiService, UserResponse } from '../../services/user-api.service';
import { UserManagementService } from '../../services/user-management.service';
import { MODULES } from '../../config/endpoints';
import { UserRole, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '../../config/user.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSortModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatCardModule, MatSlideToggleModule, MatDividerModule, MatChipsModule,
    MatExpansionModule, MatDialogModule, MatMenuModule,
    TranslatePipe,
  ],
  template: `
    <div class="user-mgmt-root">
      <!-- ─── Header ─── -->
      <div class="page-header">
        <div class="page-header-left">
          <mat-icon class="page-header-icon">group</mat-icon>
          <div>
            <h1 class="page-title">{{ 'users.title' | t }}</h1>
            <p class="page-subtitle">{{ 'users.subtitle' | t }}</p>
          </div>
        </div>
        <div class="page-header-actions">
          @if (userMgmt.isAdmin()) {
            <button mat-flat-button color="primary" (click)="showAddForm.set(!showAddForm())">
              <mat-icon>{{ showAddForm() ? 'close' : 'person_add' }}</mat-icon>
              {{ showAddForm() ? ('users.cancel' | t) : ('users.add-user' | t) }}
            </button>
          }
          <button mat-stroked-button (click)="loadUsers()" [disabled]="loading()">
            <mat-icon>refresh</mat-icon> {{ 'common.refresh' | t }}
          </button>
        </div>
      </div>

      <!-- ─── Add User Form ─── -->
      @if (showAddForm()) {
        <mat-card class="add-user-card">
          <mat-card-content>
            <h3 class="section-label"><mat-icon>person_add</mat-icon> {{ 'users.add-user' | t }}</h3>
            <p class="add-user-desc">{{ 'users.add-user-desc' | t }}</p>
            <div class="add-user-form">
              <mat-form-field appearance="outline" class="add-field">
                <mat-label>{{ 'users.email' | t }}</mat-label>
                <input matInput type="email" [(ngModel)]="newUserEmail" required />
                @if (!newUserEmail.trim()) {
                  <mat-error>{{ 'users.email-required' | t }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="add-field">
                <mat-label>{{ 'users.name' | t }}</mat-label>
                <input matInput [(ngModel)]="newUserName" required />
                @if (!newUserName.trim()) {
                  <mat-error>{{ 'users.name-required' | t }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="add-field">
                <mat-label>{{ 'users.photo-url' | t }}</mat-label>
                <input matInput [(ngModel)]="newUserPhoto" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="add-field-role">
                <mat-label>{{ 'users.add-role' | t }}</mat-label>
                <mat-select [(value)]="newUserRole">
                  @for (r of roleOptions; track r.value) {
                    <mat-option [value]="r.value">{{ r.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <div class="add-user-actions">
                <button mat-flat-button color="primary"
                        [disabled]="!newUserEmail.trim() || !newUserName.trim() || addingUser()"
                        (click)="addUser()">
                  @if (addingUser()) {
                    <mat-spinner diameter="18" />
                  } @else {
                    <mat-icon>check</mat-icon>
                  }
                  {{ 'users.create' | t }}
                </button>
                <button mat-stroked-button (click)="cancelAdd()">
                  {{ 'users.cancel' | t }}
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <!-- ─── Search & Filter ─── -->
      <mat-card class="filter-card">
        <mat-card-content class="filter-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>{{ 'users.search' | t }}</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input matInput
                   [placeholder]="'users.search-placeholder' | t"
                   [(ngModel)]="searchTerm"
                   (ngModelChange)="applyFilter()" />
            @if (searchTerm) {
              <button matSuffix mat-icon-button (click)="searchTerm = ''; applyFilter()">
                <mat-icon>clear</mat-icon>
              </button>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="role-filter-field">
            <mat-label>{{ 'users.filter-role' | t }}</mat-label>
            <mat-select [(value)]="filterRole" (selectionChange)="applyFilter()">
              <mat-option value="all">{{ 'users.all-roles' | t }}</mat-option>
              @for (r of roleOptions; track r.value) {
                <mat-option [value]="r.value">{{ r.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="role-filter-field">
            <mat-label>{{ 'users.filter-status' | t }}</mat-label>
            <mat-select [(value)]="filterStatus" (selectionChange)="applyFilter()">
              <mat-option value="all">{{ 'users.all-statuses' | t }}</mat-option>
              <mat-option value="active">{{ 'users.status-active' | t }}</mat-option>
              <mat-option value="pending">{{ 'users.status-pending' | t }}</mat-option>
              <mat-option value="revoked">{{ 'users.status-revoked' | t }}</mat-option>
            </mat-select>
          </mat-form-field>

          <span class="user-count">
            {{ filteredUsers().length }} / {{ users().length }} {{ 'users.users-label' | t }}
          </span>
        </mat-card-content>
      </mat-card>

      <!-- ─── Loading ─── -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40" />
          <span class="loading-text">{{ 'common.loading' | t }}</span>
        </div>
      }

      <!-- ─── User list ─── -->
      @if (!loading() && filteredUsers().length === 0) {
        <mat-card class="empty-card">
          <mat-card-content class="empty-state">
            <mat-icon class="empty-icon">person_off</mat-icon>
            <p>{{ 'users.no-users' | t }}</p>
          </mat-card-content>
        </mat-card>
      }

      @if (!loading()) {
        <div class="users-list">
          @for (user of filteredUsers(); track user.email) {
            <mat-expansion-panel class="user-panel">
              <mat-expansion-panel-header>
                <mat-panel-title class="user-panel-title">
                  @if (user.photoUrl) {
                    <img [src]="user.photoUrl" class="user-avatar" alt="" />
                  } @else {
                    <mat-icon class="user-avatar-icon">account_circle</mat-icon>
                  }
                  <div class="user-info-col">
                    <span class="user-name-text">{{ user.name || user.email }}</span>
                    <span class="user-email-text">{{ user.email }}</span>
                  </div>
                </mat-panel-title>
                <mat-panel-description class="user-panel-desc">
                  <span class="badge" [class]="'badge-status-' + (user.status || 'active')">{{ statusLabel(user.status) }}</span>
                  <span class="badge" [class]="'badge-role-' + user.role">{{ roleLabel(user.role) }}</span>
                  @if (user.email === userMgmt.currentUser()?.email) {
                    <span class="badge badge-you">{{ 'users.you' | t }}</span>
                  }
                </mat-panel-description>
              </mat-expansion-panel-header>

              <!-- ─── User detail ─── -->
              <div class="user-detail">
                <!-- Meta info -->
                <div class="user-meta">
                  <div class="meta-item">
                    <mat-icon>calendar_today</mat-icon>
                    <span><strong>{{ 'users.first-login' | t }}:</strong> {{ user.createdAt | date:'medium' }}</span>
                  </div>
                  <div class="meta-item">
                    <mat-icon>login</mat-icon>
                    <span><strong>{{ 'users.last-login' | t }}:</strong> {{ user.lastLoginAt | date:'medium' }}</span>
                  </div>
                </div>

                <mat-divider />

                <!-- Role selector -->
                @if (userMgmt.isAdmin()) {
                  <div class="role-section">
                    <h3 class="section-label">{{ 'users.role' | t }}</h3>
                    <div class="role-selector-row">
                      <mat-form-field appearance="outline" class="role-select">
                        <mat-label>{{ 'users.role' | t }}</mat-label>
                        <mat-select [value]="user.role" (selectionChange)="changeRole(user.email, $event.value)">
                          @for (r of roleOptions; track r.value) {
                            <mat-option [value]="r.value">
                              <div class="role-option">
                                <strong>{{ r.label }}</strong>
                                <span class="role-desc">{{ r.description }}</span>
                              </div>
                            </mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                    </div>
                  </div>

                  <mat-divider />
                }

                <!-- Per-user module toggles -->
                @if (userMgmt.isAdmin()) {
                  <div class="modules-section">
                    <h3 class="section-label">{{ 'users.module-access' | t }}</h3>
                    <div class="toggle-actions">
                      <button mat-stroked-button (click)="enableAllForUser(user.email)">
                        <mat-icon>check_box</mat-icon> {{ 'settings.enable-all' | t }}
                      </button>
                      <button mat-stroked-button (click)="disableAllForUser(user.email)">
                        <mat-icon>check_box_outline_blank</mat-icon> {{ 'settings.disable-all' | t }}
                      </button>
                      <span class="toggle-count">{{ userEnabledCount(user) }} / {{ allModules.length }}</span>
                    </div>
                    <div class="toggle-list">
                      @for (mod of allModules; track mod.id) {
                        <div class="toggle-row">
                          <mat-icon class="toggle-module-icon">{{ mod.icon }}</mat-icon>
                          <span class="toggle-module-label">{{ mod.label }}</span>
                          <mat-slide-toggle
                            [checked]="isUserModuleEnabled(user, mod.id)"
                            (change)="toggleModule(user.email, mod.id, $event.checked)"
                            color="primary" />
                        </div>
                      }
                    </div>
                  </div>

                  <mat-divider />
                }

                <!-- Approve / Revoke / Resend -->
                @if (userMgmt.isAdmin() && user.email !== userMgmt.currentUser()?.email) {
                  <div class="status-actions">
                    <h3 class="section-label">{{ 'users.status-actions' | t }}</h3>
                    <div class="status-btn-row">
                      @if (user.status === 'pending') {
                        <button mat-flat-button color="primary" (click)="approveUser(user.email)">
                          <mat-icon>check_circle</mat-icon> {{ 'users.approve' | t }}
                        </button>
                      }
                      @if (user.status === 'active') {
                        <button mat-stroked-button color="warn" (click)="revokeUser(user.email, user.name)">
                          <mat-icon>block</mat-icon> {{ 'users.revoke' | t }}
                        </button>
                      }
                      @if (user.status === 'revoked') {
                        <button mat-flat-button color="primary" (click)="approveUser(user.email)">
                          <mat-icon>restore</mat-icon> {{ 'users.reactivate' | t }}
                        </button>
                      }
                      @if (user.status === 'active' || user.status === 'pending') {
                        <button mat-stroked-button (click)="resendInvite(user.email)">
                          <mat-icon>send</mat-icon> {{ 'users.resend-invite' | t }}
                        </button>
                      }
                    </div>
                  </div>
                  <mat-divider />
                }

                <!-- Remove user -->
                @if (userMgmt.isAdmin() && user.email !== userMgmt.currentUser()?.email) {
                  <div class="danger-zone">
                    <h3 class="section-label danger-label">{{ 'users.danger-zone' | t }}</h3>
                    <button mat-stroked-button color="warn" (click)="removeUser(user.email, user.name)">
                      <mat-icon>person_remove</mat-icon> {{ 'users.remove' | t }}
                    </button>
                  </div>
                }
              </div>
            </mat-expansion-panel>
          }
        </div>
      }
    </div>

    <!-- Invite link dialog -->
    <ng-template #inviteLinkTpl>
      <h2 mat-dialog-title>{{ 'users.invite-link' | t }}</h2>
      <mat-dialog-content>
        <div class="invite-link-box">
          <input readonly class="invite-link-input" [value]="inviteLink()" (click)="$event.target.select()" />
          <button mat-icon-button (click)="copyInviteLink()" [matTooltip]="'Copy'">
            <mat-icon>{{ linkCopied() ? 'check' : 'content_copy' }}</mat-icon>
          </button>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>{{ 'common.close' | t }}</button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .user-mgmt-root {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
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
      color: #5f6368;
    }
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .page-subtitle {
      margin: 2px 0 0;
      color: #5f6368;
      font-size: 14px;
    }

    /* ── Filter card ── */
    .filter-card {
      margin-bottom: 20px;
    }
    .filter-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 1;
      min-width: 240px;
    }
    .role-filter-field {
      width: 180px;
    }
    .user-count {
      color: #5f6368;
      font-size: 13px;
      white-space: nowrap;
    }

    /* ── Loading ── */
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 0;
    }
    .loading-text {
      color: #5f6368;
    }

    /* ── Empty ── */
    .empty-card { margin-top: 8px; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: #5f6368;
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    /* ── User list ── */
    .users-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .user-panel { border-radius: 8px !important; }

    .user-panel-title {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .user-avatar-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #bdbdbd;
      flex-shrink: 0;
    }
    .user-info-col {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .user-name-text {
      font-weight: 500;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-email-text {
      font-size: 12px;
      color: #5f6368;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-panel-desc {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
    }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .badge-role-admin {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-role-manager {
      background: #e3f2fd;
      color: #1565c0;
    }
    .badge-role-user {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    .badge-you {
      background: #fff3e0;
      color: #e65100;
      font-style: italic;
    }
    .badge-status-active {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .badge-status-pending {
      background: #fff8e1;
      color: #f57f17;
    }
    .badge-status-revoked {
      background: #ffebee;
      color: #c62828;
    }

    /* ── User detail ── */
    .user-detail {
      padding: 8px 0;
    }
    .user-meta {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: #5f6368;
    }
    .meta-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #9e9e9e;
    }

    mat-divider { margin: 16px 0 !important; }

    .section-label {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 12px;
      color: #202124;
    }

    /* ── Role selector ── */
    .role-section { margin-bottom: 4px; }
    .role-selector-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .role-select {
      width: 360px;
      max-width: 100%;
    }
    .role-option {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .role-desc {
      font-size: 11px;
      color: #5f6368;
    }

    /* ── Module toggles ── */
    .modules-section { margin-bottom: 4px; }
    .toggle-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .toggle-count {
      color: #5f6368;
      font-size: 13px;
      margin-left: auto;
    }
    .toggle-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 8px;
    }
    .toggle-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 6px;
      background: #fafafa;
    }
    .toggle-module-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #5f6368;
    }
    .toggle-module-label {
      flex: 1;
      font-size: 13px;
    }

    /* ── Danger zone ── */
    .danger-zone {
      padding-top: 4px;
    }
    .danger-label { color: #c62828 !important; }

    /* ── Add User form ── */
    .add-user-card {
      margin-bottom: 20px;
      border-left: 4px solid #1a73e8;
    }
    .add-user-desc {
      margin: 0 0 16px;
      color: #5f6368;
      font-size: 13px;
    }
    .add-user-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: flex-start;
    }
    .add-field {
      flex: 1 1 220px;
      min-width: 200px;
    }
    .add-field-role {
      flex: 0 0 180px;
    }
    .add-user-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      padding-top: 6px;
      flex-basis: 100%;
    }

    /* ── Status actions ── */
    .status-actions { margin-bottom: 4px; }
    .status-btn-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* ── Invite link dialog ── */
    .invite-link-box {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }
    .invite-link-input {
      flex: 1;
      font-size: 13px;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      color: #1e293b;
      min-width: 400px;
      cursor: text;
    }
  `],
})
export class UserManagementComponent implements OnInit {
  private readonly userApi = inject(UserApiService);
  readonly userMgmt = inject(UserManagementService);
  private readonly snack = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  readonly i18n = inject(TranslateService);

  readonly inviteLinkTpl = viewChild<TemplateRef<unknown>>('inviteLinkTpl');
  readonly inviteLink = signal('');
  readonly linkCopied = signal(false);

  readonly allModules = MODULES;
  readonly loading = signal(false);
  readonly users = signal<UserResponse[]>([]);

  /* ─── Add-user form state ─── */
  readonly showAddForm = signal(false);
  readonly addingUser = signal(false);
  newUserEmail = '';
  newUserName = '';
  newUserPhoto = '';
  newUserRole: UserRole = 'user';

  searchTerm = '';
  filterRole = 'all';
  filterStatus = 'all';

  readonly roleOptions = [
    { value: 'admin' as UserRole, label: USER_ROLE_LABELS.admin, description: USER_ROLE_DESCRIPTIONS.admin },
    { value: 'manager' as UserRole, label: USER_ROLE_LABELS.manager, description: USER_ROLE_DESCRIPTIONS.manager },
    { value: 'user' as UserRole, label: USER_ROLE_LABELS.user, description: USER_ROLE_DESCRIPTIONS.user },
  ];

  /** Filtered user list (computed) */
  private _filtered = signal<UserResponse[]>([]);
  readonly filteredUsers = this._filtered.asReadonly();

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await firstValueFrom(this.userApi.listAll());
      this.users.set(Array.isArray(list) ? list : []);
      this.applyFilter();
    } catch {
      this.snack.open(this.i18n.t('users.load-error'), 'OK', { duration: 4000 });
      this.users.set([]);
      this.applyFilter();
    } finally {
      this.loading.set(false);
    }
  }

  /* ─── Add user ─── */
  async addUser(): Promise<void> {
    if (!this.newUserEmail.trim() || !this.newUserName.trim()) return;
    this.addingUser.set(true);
    try {
      const created = await firstValueFrom(
        this.userApi.registerLogin(this.newUserEmail.trim(), this.newUserName.trim(), this.newUserPhoto.trim()),
      );
      // If a specific role was selected (not the default), update it
      if (this.newUserRole !== 'user') {
        const updated = await firstValueFrom(this.userApi.setRole(created.email, this.newUserRole));
        this.users.update(list => [updated, ...list]);
      } else {
        this.users.update(list => [created, ...list]);
      }
      this.applyFilter();
      this.cancelAdd();
      this.snack.open(this.i18n.t('users.user-created'), 'OK', { duration: 3000 });
    } catch {
      this.snack.open(this.i18n.t('users.create-error'), 'OK', { duration: 4000 });
    } finally {
      this.addingUser.set(false);
    }
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
    this.newUserEmail = '';
    this.newUserName = '';
    this.newUserPhoto = '';
    this.newUserRole = 'user';
  }

  applyFilter(): void {
    let result = this.users();
    if (this.filterRole !== 'all') {
      result = result.filter(u => u.role === this.filterRole);
    }
    if (this.filterStatus !== 'all') {
      result = result.filter(u => (u.status || 'active') === this.filterStatus);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
      );
    }
    this._filtered.set(result);
  }

  roleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role] ?? role;
  }

  statusLabel(status: string | undefined): string {
    switch (status) {
      case 'pending': return this.i18n.t('users.status-pending');
      case 'revoked': return this.i18n.t('users.status-revoked');
      default: return this.i18n.t('users.status-active');
    }
  }

  /* ─── Approve / Revoke / Resend ─── */

  async approveUser(email: string): Promise<void> {
    try {
      const updated = await firstValueFrom(this.userApi.approve(email));
      this.updateLocal(email, updated);
      this.snack.open(this.i18n.t('users.user-approved'), 'OK', { duration: 3000 });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  async revokeUser(email: string, name: string): Promise<void> {
    const msg = this.i18n.t('users.revoke-confirm', { name });
    if (!confirm(msg)) return;
    try {
      const updated = await firstValueFrom(this.userApi.revoke(email));
      this.updateLocal(email, updated);
      this.snack.open(this.i18n.t('users.user-revoked'), 'OK', { duration: 3000 });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  async resendInvite(email: string): Promise<void> {
    try {
      const result = await firstValueFrom(this.userApi.resendInvite(email));
      this.inviteLink.set(result.passwordSetLink);
      this.linkCopied.set(false);
      const tpl = this.inviteLinkTpl();
      if (tpl) this.dialog.open(tpl, { width: '560px' });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  async copyInviteLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.inviteLink());
      this.linkCopied.set(true);
    } catch {
      /* fallback: already displayed in the input */
    }
  }

  async changeRole(email: string, newRole: UserRole): Promise<void> {
    try {
      const updated = await firstValueFrom(this.userApi.setRole(email, newRole));
      this.updateLocal(email, updated);
      // also update local service for sidebar reactivity
      this.userMgmt.setRole(email, newRole);
      this.snack.open(this.i18n.t('users.role-updated', { role: this.roleLabel(newRole) }), 'OK', { duration: 3000 });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  async removeUser(email: string, name: string): Promise<void> {
    const msg = this.i18n.t('users.remove-confirm', { name });
    if (!confirm(msg)) return;
    try {
      await firstValueFrom(this.userApi.remove(email));
      this.users.update(list => list.filter(u => u.email !== email));
      this.userMgmt.removeUser(email);
      this.applyFilter();
      this.snack.open(this.i18n.t('users.user-removed'), 'OK', { duration: 3000 });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  isUserModuleEnabled(user: UserResponse, moduleId: string): boolean {
    return user.moduleVisibility?.[moduleId] ?? false;
  }

  userEnabledCount(user: UserResponse): number {
    return this.allModules.filter(m => this.isUserModuleEnabled(user, m.id)).length;
  }

  async toggleModule(email: string, moduleId: string, enabled: boolean): Promise<void> {
    try {
      const updated = await firstValueFrom(this.userApi.setModuleVisibility(email, moduleId, enabled));
      this.updateLocal(email, updated);
      this.userMgmt.setModuleEnabled(email, moduleId, enabled);
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  async enableAllForUser(email: string): Promise<void> {
    const ids = this.allModules.map(m => m.id);
    try {
      const updated = await firstValueFrom(this.userApi.setAllModulesEnabled(email, ids, true));
      this.updateLocal(email, updated);
      this.userMgmt.setAllModulesEnabled(email, ids, true);
      this.snack.open(this.i18n.t('users.all-enabled'), 'OK', { duration: 2000 });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  async disableAllForUser(email: string): Promise<void> {
    const ids = this.allModules.map(m => m.id);
    try {
      const updated = await firstValueFrom(this.userApi.setAllModulesEnabled(email, ids, false));
      this.updateLocal(email, updated);
      this.userMgmt.setAllModulesEnabled(email, ids, false);
      this.snack.open(this.i18n.t('users.all-disabled'), 'OK', { duration: 2000 });
    } catch {
      this.snack.open(this.i18n.t('users.update-error'), 'OK', { duration: 4000 });
    }
  }

  /** Patch a user in the local signal after an API mutiation */
  private updateLocal(email: string, updated: UserResponse): void {
    this.users.update(list =>
      list.map(u => u.email === email ? { ...u, ...updated } : u),
    );
    this.applyFilter();
  }
}
