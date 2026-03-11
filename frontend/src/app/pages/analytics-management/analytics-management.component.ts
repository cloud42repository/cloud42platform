import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { firstValueFrom } from 'rxjs';
import { ZohoAnalyticsService } from '../../services/zoho-analytics.service';

type PanelMode = 'hidden' | 'create' | 'edit';

@Component({
  selector: 'app-analytics-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTabsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule,
    MatCardModule, MatDividerModule, MatChipsModule,
  ],
  templateUrl: './analytics-management.component.html',
  styleUrl:    './analytics-management.component.scss',
})
export class AnalyticsManagementComponent implements OnInit {
  private readonly analyticsSvc = inject(ZohoAnalyticsService);
  private readonly snack = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadWorkspaces();
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 1  Workspaces
  // ══════════════════════════════════════════════════════════════════════════

  wsLoading = signal(false);
  workspaces = signal<any[]>([]);
  wsPanelMode: PanelMode = 'hidden';
  wsForm = { workspaceName: '', description: '' };
  readonly wsColumns = ['name', 'workspaceId', 'actions'];

  async loadWorkspaces() {
    this.wsLoading.set(true);
    try {
      const res = await firstValueFrom(this.analyticsSvc.listWorkspaces()) as any;
      const list = res?.data ?? res?.workspaces ?? res ?? [];
      this.workspaces.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load workspaces: ' + (e?.message ?? e), true);
    } finally { this.wsLoading.set(false); }
  }

  openWsCreate() {
    this.wsForm = { workspaceName: '', description: '' };
    this.wsPanelMode = 'create';
  }

  cancelWsPanel() { this.wsPanelMode = 'hidden'; }

  async saveWsCreate() {
    if (!this.wsForm.workspaceName) { this.toast('Name is required.', true); return; }
    this.wsLoading.set(true);
    try {
      await firstValueFrom(this.analyticsSvc.createWorkspace(this.wsForm));
      this.toast('Workspace created.');
      this.cancelWsPanel();
      await this.loadWorkspaces();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.wsLoading.set(false); }
  }

  async deleteWs(ws: any) {
    if (!confirm(`Delete workspace "${ws.workspaceName ?? ws.name}"?`)) return;
    this.wsLoading.set(true);
    try {
      await firstValueFrom(this.analyticsSvc.deleteWorkspace(ws.workspaceId ?? ws.id));
      this.toast('Workspace deleted.');
      await this.loadWorkspaces();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.wsLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 2  Views
  // ══════════════════════════════════════════════════════════════════════════

  viewLoading = signal(false);
  views = signal<any[]>([]);
  selectedWsId = '';
  viewPanelMode: PanelMode = 'hidden';
  viewForm = { viewName: '', viewType: 'TABLE' };
  readonly viewColumns = ['viewName', 'viewId', 'viewType', 'actions'];
  readonly viewTypes = ['TABLE', 'CHART', 'PIVOT', 'SUMMARY', 'QUERY'];

  async loadViews() {
    if (!this.selectedWsId) { this.toast('Select a workspace first.', true); return; }
    this.viewLoading.set(true);
    try {
      const res = await firstValueFrom(this.analyticsSvc.listViews(this.selectedWsId)) as any;
      const list = res?.data ?? res?.views ?? res ?? [];
      this.views.set(Array.isArray(list) ? list : []);
    } catch (e: any) {
      this.toast('Failed to load views: ' + (e?.message ?? e), true);
    } finally { this.viewLoading.set(false); }
  }

  openViewCreate() {
    this.viewForm = { viewName: '', viewType: 'TABLE' };
    this.viewPanelMode = 'create';
  }

  cancelViewPanel() { this.viewPanelMode = 'hidden'; }

  async saveViewCreate() {
    if (!this.selectedWsId || !this.viewForm.viewName) { this.toast('Workspace and view name are required.', true); return; }
    this.viewLoading.set(true);
    try {
      await firstValueFrom(this.analyticsSvc.createView(this.selectedWsId, this.viewForm));
      this.toast('View created.');
      this.cancelViewPanel();
      await this.loadViews();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.viewLoading.set(false); }
  }

  async deleteView(v: any) {
    if (!confirm(`Delete view "${v.viewName ?? v.name}"?`)) return;
    this.viewLoading.set(true);
    try {
      await firstValueFrom(this.analyticsSvc.deleteView(this.selectedWsId, v.viewId ?? v.id));
      this.toast('View deleted.');
      await this.loadViews();
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.viewLoading.set(false); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TAB 3  Import
  // ══════════════════════════════════════════════════════════════════════════

  importLoading = signal(false);
  importForm = { workspaceId: '', viewId: '', importType: 'APPEND', fileUrl: '' };
  readonly importTypes = ['APPEND', 'TRUNCATEADD', 'UPDATEADD'];

  async runImport() {
    if (!this.importForm.workspaceId || !this.importForm.viewId) {
      this.toast('Workspace ID and View ID are required.', true); return;
    }
    this.importLoading.set(true);
    try {
      await firstValueFrom(this.analyticsSvc.importData(this.importForm));
      this.toast('Import started successfully.');
    } catch (e: any) {
      this.toast('Error: ' + (e?.error?.message ?? e?.message ?? 'Unknown error'), true);
    } finally { this.importLoading.set(false); }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private toast(msg: string, error = false) {
    this.snack.open(msg, 'Close', {
      duration: 4000,
      panelClass: error ? ['snack-error'] : ['snack-ok'],
    });
  }
}
