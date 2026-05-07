import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApplicationService } from '../../services/application.service';
import { ApplicationDefinition, AppPage, AppNavigation } from '../../config/application.types';
import { FormService } from '../../services/form.service';
import { DashboardService } from '../../services/dashboard.service';
import { WorkflowService } from '../../services/workflow.service';
import { ShareService } from '../../services/share.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-application-builder',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DragDropModule,
    MatButtonModule, MatIconModule, MatTooltipModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDividerModule, MatMenuModule, MatSnackBarModule, MatDialogModule,
    TranslatePipe,
  ],
  template: `
    <div class="builder">
      <!-- ═══ TOP TOOLBAR ═══ -->
      <div class="builder-toolbar">
        <button mat-icon-button (click)="goBack()" matTooltip="Back to list">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <mat-icon class="toolbar-icon">apps</mat-icon>
        <input class="app-name-input"
               [value]="appName()"
               (input)="appName.set($any($event.target).value)"
               (blur)="save()"
               placeholder="Application name" />
        <span class="spacer"></span>

        <button mat-icon-button [matMenuTriggerFor]="statusMenu" matTooltip="Status">
          <mat-icon [class]="'status-icon status-' + appStatus()">
            {{ appStatus() === 'published' ? 'check_circle' : 'edit' }}
          </mat-icon>
        </button>
        <mat-menu #statusMenu="matMenu">
          <button mat-menu-item (click)="appStatus.set('draft'); save()">
            <mat-icon>edit</mat-icon> Draft
          </button>
          <button mat-menu-item (click)="appStatus.set('published'); save()">
            <mat-icon>check_circle</mat-icon> Published
          </button>
        </mat-menu>

        <button mat-icon-button (click)="preview()" matTooltip="Preview application">
          <mat-icon>visibility</mat-icon>
        </button>

        <button mat-icon-button (click)="shareApp()" matTooltip="Share application">
          <mat-icon>share</mat-icon>
        </button>

        <button mat-flat-button color="primary" (click)="save()" class="save-btn">
          <mat-icon>save</mat-icon> Save
        </button>
      </div>

      <div class="builder-body">
        <!-- ═══ LEFT PANEL: Pages ═══ -->
        <div class="pages-panel">
          <div class="panel-header">
            <h3>Pages</h3>
            <button mat-icon-button [matMenuTriggerFor]="addPageMenu" matTooltip="Add page" class="add-btn">
              <mat-icon>add</mat-icon>
            </button>
            <mat-menu #addPageMenu="matMenu">
              <button mat-menu-item (click)="addPage('form')">
                <mat-icon>edit_note</mat-icon> Form Page
              </button>
              <button mat-menu-item (click)="addPage('dashboard')">
                <mat-icon>dashboard</mat-icon> Dashboard Page
              </button>
              <button mat-menu-item (click)="addPage('workflow')">
                <mat-icon>account_tree</mat-icon> Workflow Page
              </button>
            </mat-menu>
          </div>

          <div class="pages-list" cdkDropList (cdkDropListDropped)="reorderPages($event)">
            @for (page of pages(); track page.id) {
              <div class="page-item"
                   cdkDrag
                   [class.selected]="selectedPageId() === page.id"
                   (click)="selectedPageId.set(page.id)">
                <mat-icon cdkDragHandle class="drag-handle">drag_indicator</mat-icon>
                <mat-icon class="page-type-icon type-{{ page.type }}">
                  @if (page.type === 'form') { edit_note }
                  @else if (page.type === 'dashboard') { dashboard }
                  @else { account_tree }
                </mat-icon>
                <span class="page-label">{{ page.label || 'Untitled' }}</span>
                @if (navigation().homePage === page.id) {
                  <mat-icon class="home-badge" matTooltip="Home page">home</mat-icon>
                }
                <button mat-icon-button class="page-delete-btn"
                        (click)="removePage(page.id); $event.stopPropagation()"
                        matTooltip="Remove page">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>

          @if (pages().length === 0) {
            <div class="pages-empty">
              <mat-icon>layers</mat-icon>
              <p>Add pages using the + button above</p>
            </div>
          }
        </div>

        <!-- ═══ CENTER: Preview ═══ -->
        <div class="preview-panel">
          @if (selectedPage(); as page) {
            <div class="preview-header">
              <mat-icon class="type-{{ page.type }}">
                @if (page.type === 'form') { edit_note }
                @else if (page.type === 'dashboard') { dashboard }
                @else { account_tree }
              </mat-icon>
              <span class="preview-title">{{ page.label || 'Untitled' }}</span>
              <span class="preview-badge">{{ page.type | uppercase }}</span>
              @if (selectedItemName()) {
                <span class="preview-item-name">→ {{ selectedItemName() }}</span>
              }
            </div>
            <div class="preview-body">
              @if (!page.itemId) {
                <div class="preview-empty">
                  <mat-icon>link_off</mat-icon>
                  <p>Select a {{ page.type }} in the properties panel →</p>
                </div>
              } @else {
                <div class="preview-placeholder">
                  <mat-icon style="font-size:48px;width:48px;height:48px;color:#94a3b8">
                    @if (page.type === 'form') { edit_note }
                    @else if (page.type === 'dashboard') { dashboard }
                    @else { account_tree }
                  </mat-icon>
                  <p class="preview-item-label">{{ selectedItemName() }}</p>
                  <p class="preview-hint">This {{ page.type }} will be rendered here at runtime</p>
                </div>
              }
            </div>
          } @else {
            <div class="preview-empty-full">
              <mat-icon style="font-size:64px;width:64px;height:64px;color:#cbd5e1">apps</mat-icon>
              <p>Select a page from the left panel to configure it</p>
            </div>
          }
        </div>

        <!-- ═══ RIGHT PANEL: Properties ═══ -->
        <div class="props-panel">
          @if (selectedPage(); as page) {
            <div class="panel-header"><h3>Page Properties</h3></div>

            <div class="props-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Label</mat-label>
                <input matInput [value]="page.label" (input)="updatePage(page.id, 'label', $any($event.target).value)" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Icon</mat-label>
                <input matInput [value]="page.icon" (input)="updatePage(page.id, 'icon', $any($event.target).value)"
                       placeholder="e.g. home, dashboard, edit_note" />
                <mat-icon matSuffix>{{ page.icon || 'help_outline' }}</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ page.type | titlecase }} to display</mat-label>
                <mat-select [value]="page.itemId" (selectionChange)="updatePage(page.id, 'itemId', $event.value)">
                  @if (page.type === 'form') {
                    @for (f of formSvc.forms(); track f.id) {
                      <mat-option [value]="f.id">{{ f.name || f.id }}</mat-option>
                    }
                  }
                  @if (page.type === 'dashboard') {
                    @for (d of dashSvc.dashboards(); track d.id) {
                      <mat-option [value]="d.id">{{ d.name || d.id }}</mat-option>
                    }
                  }
                  @if (page.type === 'workflow') {
                    @for (w of wfSvc.workflows(); track w.id) {
                      <mat-option [value]="w.id">{{ w.name || w.id }}</mat-option>
                    }
                  }
                </mat-select>
              </mat-form-field>

              <div class="home-toggle">
                <button mat-stroked-button
                        [class.active]="navigation().homePage === page.id"
                        (click)="setHomePage(page.id)">
                  <mat-icon>home</mat-icon>
                  {{ navigation().homePage === page.id ? 'Home page' : 'Set as home' }}
                </button>
              </div>
            </div>

            <mat-divider />

            <div class="panel-header"><h3>Navigation</h3></div>
            <div class="props-section">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Navigation Style</mat-label>
                <mat-select [value]="navigation().style" (selectionChange)="updateNavStyle($event.value)">
                  <mat-option value="sidebar">Sidebar</mat-option>
                  <mat-option value="tabs">Tabs</mat-option>
                  <mat-option value="top-bar">Top Bar</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          } @else {
            <div class="props-empty">
              <mat-icon>tune</mat-icon>
              <p>Select a page to edit its properties</p>
            </div>
          }

          <mat-divider />

          <div class="panel-header"><h3>App Settings</h3></div>
          <div class="props-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput
                        [value]="appDescription()"
                        (input)="appDescription.set($any($event.target).value)"
                        (blur)="save()"
                        rows="3"
                        placeholder="App description"></textarea>
            </mat-form-field>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .builder { display: flex; flex-direction: column; height: 100%; background: #f8fafc; }

    /* Toolbar */
    .builder-toolbar {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px;
      background: #fff; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
    }
    .toolbar-icon { color: #6366f1; }
    .app-name-input {
      border: none; outline: none; font-size: 16px; font-weight: 600;
      background: transparent; min-width: 200px; padding: 4px 8px;
      border-radius: 6px;
    }
    .app-name-input:focus { background: #f1f5f9; }
    .spacer { flex: 1; }
    .status-icon.status-draft { color: #f59e0b; }
    .status-icon.status-published { color: #10b981; }
    .save-btn mat-icon { margin-right: 4px; font-size: 18px; }

    /* Body layout */
    .builder-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }

    /* Pages panel */
    .pages-panel {
      width: 260px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px 8px; flex-shrink: 0;
    }
    .panel-header h3 { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; }
    .add-btn { width: 28px; height: 28px; line-height: 28px; }
    .add-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .pages-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
    .page-item {
      display: flex; align-items: center; gap: 6px; padding: 8px 10px;
      border-radius: 8px; cursor: pointer; transition: background 0.1s;
      margin-bottom: 4px; border: 1px solid transparent;
    }
    .page-item:hover { background: #f1f5f9; }
    .page-item.selected { background: #ede9fe; border-color: #c4b5fd; }
    .drag-handle { font-size: 16px; width: 16px; height: 16px; color: #94a3b8; cursor: grab; }
    .page-type-icon { font-size: 18px; width: 18px; height: 18px; }
    .type-form { color: #7c3aed; }
    .type-dashboard { color: #2563eb; }
    .type-workflow { color: #d97706; }
    .page-label { flex: 1; font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .home-badge { font-size: 14px; width: 14px; height: 14px; color: #10b981; }
    .page-delete-btn { width: 24px; height: 24px; line-height: 24px; opacity: 0; transition: opacity 0.1s; }
    .page-delete-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .page-item:hover .page-delete-btn { opacity: 1; }

    .pages-empty { text-align: center; padding: 32px 16px; color: #94a3b8; }
    .pages-empty mat-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; }
    .pages-empty p { font-size: 12px; margin: 8px 0 0; }

    /* Preview panel */
    .preview-panel {
      flex: 1; display: flex; flex-direction: column; min-width: 0;
      background: #f1f5f9;
    }
    .preview-header {
      display: flex; align-items: center; gap: 8px; padding: 12px 20px;
      background: #fff; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
    }
    .preview-title { font-weight: 600; font-size: 14px; }
    .preview-badge {
      font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;
      background: #f1f5f9; color: #64748b;
    }
    .preview-item-name { font-size: 12px; color: #6366f1; }
    .preview-body { flex: 1; display: flex; align-items: center; justify-content: center; }
    .preview-empty, .preview-empty-full {
      text-align: center; color: #94a3b8;
    }
    .preview-empty p, .preview-empty-full p { font-size: 13px; }
    .preview-placeholder { text-align: center; }
    .preview-item-label { font-size: 16px; font-weight: 600; color: #1e293b; margin: 8px 0 4px; }
    .preview-hint { font-size: 12px; color: #94a3b8; }

    /* Properties panel */
    .props-panel {
      width: 300px; flex-shrink: 0; background: #fff; border-left: 1px solid #e2e8f0;
      overflow-y: auto;
    }
    .props-section { padding: 8px 16px 12px; }
    .full-width { width: 100%; }
    .props-empty { text-align: center; padding: 32px 16px; color: #94a3b8; }
    .props-empty mat-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; }
    .props-empty p { font-size: 12px; }

    .home-toggle { margin-bottom: 8px; }
    .home-toggle button.active { background: #d1fae5; color: #065f46; }

    /* Drag & drop */
    .cdk-drag-preview {
      background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      padding: 8px 10px; display: flex; align-items: center; gap: 6px;
    }
    .cdk-drag-placeholder { opacity: 0.3; }

    /* Dark mode */
    :host-context(.dark-mode) .builder { background: #0f172a; }
    :host-context(.dark-mode) .builder-toolbar { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .app-name-input { color: #e2e8f0; }
    :host-context(.dark-mode) .app-name-input:focus { background: #334155; }
    :host-context(.dark-mode) .pages-panel { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .page-item:hover { background: #334155; }
    :host-context(.dark-mode) .page-item.selected { background: #312e81; border-color: #6366f1; }
    :host-context(.dark-mode) .preview-panel { background: #0f172a; }
    :host-context(.dark-mode) .preview-header { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .preview-title { color: #e2e8f0; }
    :host-context(.dark-mode) .props-panel { background: #1e293b; border-color: #334155; }
    :host-context(.dark-mode) .preview-item-label { color: #e2e8f0; }
  `],
})
export class ApplicationBuilderComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appSvc = inject(ApplicationService);
  readonly formSvc = inject(FormService);
  readonly dashSvc = inject(DashboardService);
  readonly wfSvc = inject(WorkflowService);
  private readonly shareSvc = inject(ShareService);
  private readonly snackBar = inject(MatSnackBar);

  private appId = '';

  appName = signal('New Application');
  appDescription = signal('');
  appStatus = signal<'draft' | 'published'>('draft');
  pages = signal<AppPage[]>([]);
  navigation = signal<AppNavigation>({ style: 'sidebar' });
  selectedPageId = signal<string | null>(null);

  selectedPage = computed(() => {
    const id = this.selectedPageId();
    return id ? this.pages().find(p => p.id === id) ?? null : null;
  });

  selectedItemName = computed(() => {
    const page = this.selectedPage();
    if (!page?.itemId) return '';
    if (page.type === 'form') return this.formSvc.forms().find(f => f.id === page.itemId)?.name ?? page.itemId;
    if (page.type === 'dashboard') return this.dashSvc.dashboards().find(d => d.id === page.itemId)?.name ?? page.itemId;
    if (page.type === 'workflow') return this.wfSvc.workflows().find(w => w.id === page.itemId)?.name ?? page.itemId;
    return '';
  });

  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.appId = id;
      const existing = this.appSvc.getById(id);
      if (existing) {
        this.appName.set(existing.name);
        this.appDescription.set(existing.description ?? '');
        this.appStatus.set(existing.status);
        this.pages.set([...existing.pages]);
        this.navigation.set({ ...existing.navigation });
        if (existing.pages.length > 0) {
          this.selectedPageId.set(existing.pages[0].id);
        }
      }
    } else {
      this.appId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    }
  }

  goBack() {
    this.save();
    this.router.navigate(['/applications']);
  }

  addPage(type: 'form' | 'dashboard' | 'workflow') {
    const id = `pg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const defaults: Record<string, string> = {
      form: 'edit_note',
      dashboard: 'dashboard',
      workflow: 'account_tree',
    };
    const page: AppPage = {
      id,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      icon: defaults[type],
      type,
      itemId: '',
    };
    this.pages.update(ps => [...ps, page]);
    this.selectedPageId.set(id);

    // Auto-set home page if first page
    if (this.pages().length === 1) {
      this.navigation.update(n => ({ ...n, homePage: id }));
    }
    this.debounceSave();
  }

  removePage(pageId: string) {
    this.pages.update(ps => ps.filter(p => p.id !== pageId));
    if (this.selectedPageId() === pageId) {
      this.selectedPageId.set(this.pages().length > 0 ? this.pages()[0].id : null);
    }
    if (this.navigation().homePage === pageId) {
      this.navigation.update(n => ({ ...n, homePage: this.pages()[0]?.id }));
    }
    this.debounceSave();
  }

  updatePage(pageId: string, field: keyof AppPage, value: string) {
    this.pages.update(ps => ps.map(p => p.id === pageId ? { ...p, [field]: value } : p));
    this.debounceSave();
  }

  setHomePage(pageId: string) {
    this.navigation.update(n => ({ ...n, homePage: pageId }));
    this.debounceSave();
  }

  updateNavStyle(style: 'sidebar' | 'tabs' | 'top-bar') {
    this.navigation.update(n => ({ ...n, style }));
    this.debounceSave();
  }

  reorderPages(event: CdkDragDrop<AppPage[]>) {
    const ps = [...this.pages()];
    moveItemInArray(ps, event.previousIndex, event.currentIndex);
    this.pages.set(ps);
    this.debounceSave();
  }

  private debounceSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), 800);
  }

  save() {
    if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
    const app: ApplicationDefinition = {
      id: this.appId,
      name: this.appName(),
      description: this.appDescription(),
      pages: this.pages(),
      navigation: this.navigation(),
      status: this.appStatus(),
    };
    this.appSvc.upsert(app);
  }

  preview() {
    this.save();
    this.router.navigate(['/applications', this.appId, 'view']);
  }

  async shareApp() {
    this.save();
    try {
      const shares = await this.shareSvc.createShare('application', this.appId);
      if (shares.length > 0) {
        const url = this.shareSvc.getShareUrl(shares[0].token);
        await navigator.clipboard.writeText(url);
        this.snackBar.open('Share link copied to clipboard!', 'OK', { duration: 3000 });
      }
    } catch {
      this.snackBar.open('Failed to create share link', 'OK', { duration: 3000 });
    }
  }
}
