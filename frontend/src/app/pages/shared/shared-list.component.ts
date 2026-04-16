import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShareService, type ShareLink } from '../../services/share.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-shared-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatTooltipModule, MatTabsModule,
    MatProgressSpinnerModule, TranslatePipe,
  ],
  template: `
    <div class="page-header">
      <div class="page-title">
        <mat-icon class="title-icon">share</mat-icon>
        <div>
          <h1>{{ 'shares.list-title' | t }}</h1>
          <p>{{ 'shares.list-subtitle' | t }}</p>
        </div>
      </div>
    </div>

    <mat-tab-group (selectedIndexChange)="activeTab.set($event)" animationDuration="200ms">
      <!-- My Shares tab -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">upload</mat-icon>
          {{ 'shares.my-shares' | t }}
          @if (myShares().length) {
            <span class="tab-badge">{{ myShares().length }}</span>
          }
        </ng-template>

        @if (loading()) {
          <div class="loading-state">
            <mat-spinner diameter="40" />
          </div>
        } @else if (myShares().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">share</mat-icon>
            <p>{{ 'shares.no-my-shares' | t }}</p>
          </div>
        } @else {
          <div class="share-grid">
            @for (share of myShares(); track share.token) {
              <div class="share-card">
                <div class="share-card-header">
                  <mat-icon class="type-icon">{{ typeIcon(share.itemType) }}</mat-icon>
                  <div class="share-info">
                    <span class="share-type-chip" [class]="'chip-' + share.itemType">{{ share.itemType }}</span>
                    <span class="share-id">{{ share.itemId }}</span>
                  </div>
                </div>

                <div class="share-meta">
                  @if (share.sharedWithEmail) {
                    <span class="meta-item">
                      <mat-icon>person</mat-icon> {{ share.sharedWithEmail }}
                    </span>
                  } @else {
                    <span class="meta-item meta-public">
                      <mat-icon>public</mat-icon> {{ 'shares.public' | t }}
                    </span>
                  }
                  <span class="meta-item">
                    <mat-icon>schedule</mat-icon> {{ share.createdAt | date:'MMM d, y' }}
                  </span>
                </div>

                <div class="share-actions">
                  <button mat-stroked-button (click)="copyLink(share.token)" [matTooltip]="'shares.copy-link' | t">
                    <mat-icon>content_copy</mat-icon> {{ 'shares.copy-link' | t }}
                  </button>
                  <a mat-stroked-button [routerLink]="['/shared', share.token]" target="_blank" [matTooltip]="'shares.open' | t">
                    <mat-icon>open_in_new</mat-icon>
                  </a>
                  <button mat-icon-button color="warn" (click)="revoke(share)" [matTooltip]="'shares.revoke' | t">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </mat-tab>

      <!-- Shared With Me tab -->
      <mat-tab>
        <ng-template mat-tab-label>
          <mat-icon class="tab-icon">download</mat-icon>
          {{ 'shares.shared-with-me' | t }}
          @if (sharedWithMe().length) {
            <span class="tab-badge">{{ sharedWithMe().length }}</span>
          }
        </ng-template>

        @if (loading()) {
          <div class="loading-state">
            <mat-spinner diameter="40" />
          </div>
        } @else if (sharedWithMe().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">folder_shared</mat-icon>
            <p>{{ 'shares.no-shared-with-me' | t }}</p>
          </div>
        } @else {
          <div class="share-grid">
            @for (share of sharedWithMe(); track share.token) {
              <div class="share-card">
                <div class="share-card-header">
                  <mat-icon class="type-icon">{{ typeIcon(share.itemType) }}</mat-icon>
                  <div class="share-info">
                    <span class="share-type-chip" [class]="'chip-' + share.itemType">{{ share.itemType }}</span>
                    <span class="share-id">{{ share.itemId }}</span>
                  </div>
                </div>

                <div class="share-meta">
                  <span class="meta-item">
                    <mat-icon>person_outline</mat-icon> {{ share.ownerEmail }}
                  </span>
                  <span class="meta-item">
                    <mat-icon>schedule</mat-icon> {{ share.createdAt | date:'MMM d, y' }}
                  </span>
                </div>

                <div class="share-actions">
                  <a mat-stroked-button [routerLink]="['/shared', share.token]" target="_blank">
                    <mat-icon>open_in_new</mat-icon> {{ 'shares.open' | t }}
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </mat-tab>
    </mat-tab-group>

    @if (copied()) {
      <div class="copied-toast">{{ 'shares.copied' | t }}</div>
    }
  `,
  styles: [`
    :host { display: block; padding: 0; }

    .page-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 0 20px;
      border-bottom: 2px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, #7c3aed, #a78bfa) border-box;
      margin-bottom: 20px;
    }
    :host-context(.dark-mode) .page-header {
      background: linear-gradient(#23232b, #23232b) padding-box,
                  linear-gradient(90deg, #7c3aed, #a78bfa) border-box;
    }

    .page-title {
      display: flex; align-items: center; gap: 16px;
    }
    .page-title h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .page-title p { margin: 2px 0 0; font-size: 13px; color: #666; }
    :host-context(.dark-mode) .page-title p { color: #aaa; }

    .title-icon {
      font-size: 36px; width: 36px; height: 36px;
      color: #7c3aed;
    }

    .tab-icon { margin-right: 6px; font-size: 18px; width: 18px; height: 18px; }
    .tab-badge {
      margin-left: 6px; background: #7c3aed; color: #fff;
      border-radius: 10px; padding: 1px 7px; font-size: 11px; font-weight: 600;
    }

    .loading-state {
      display: flex; justify-content: center; padding: 60px 0;
    }

    .empty-state {
      text-align: center; padding: 60px 20px; color: #888;
    }
    .empty-icon { font-size: 56px; width: 56px; height: 56px; opacity: .3; }

    .share-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 16px; padding: 20px 0;
    }

    .share-card {
      border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 18px; transition: box-shadow .2s;
    }
    .share-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
    :host-context(.dark-mode) .share-card {
      border-color: #333; background: #2a2a32;
    }
    :host-context(.dark-mode) .share-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.3); }

    .share-card-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .type-icon { font-size: 28px; width: 28px; height: 28px; color: #7c3aed; }
    .share-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
    .share-type-chip {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: .5px; padding: 2px 8px; border-radius: 8px; width: fit-content;
    }
    .chip-dashboard { background: #dbeafe; color: #1e40af; }
    .chip-form { background: #fce7f3; color: #9d174d; }
    .chip-workflow { background: #e0e7ff; color: #4338ca; }
    :host-context(.dark-mode) .chip-dashboard { background: #1e3a5f; color: #93c5fd; }
    :host-context(.dark-mode) .chip-form { background: #4a1942; color: #f9a8d4; }
    :host-context(.dark-mode) .chip-workflow { background: #312e81; color: #a5b4fc; }

    .share-id {
      font-size: 12px; color: #888; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
    }

    .share-meta {
      display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;
    }
    .meta-item {
      display: flex; align-items: center; gap: 4px;
      font-size: 12px; color: #666;
    }
    .meta-item mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .meta-public { color: #16a34a; font-weight: 600; }
    :host-context(.dark-mode) .meta-item { color: #aaa; }

    .share-actions {
      display: flex; align-items: center; gap: 8px;
    }

    .copied-toast {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #16a34a; color: #fff; padding: 8px 20px;
      border-radius: 8px; font-size: 13px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,.2); z-index: 9999;
      animation: fadeIn .2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } }
  `],
})
export class SharedListComponent implements OnInit {
  private readonly shareSvc = inject(ShareService);

  readonly loading = signal(true);
  readonly myShares = signal<ShareLink[]>([]);
  readonly sharedWithMe = signal<ShareLink[]>([]);
  readonly activeTab = signal(0);
  readonly copied = signal(false);

  ngOnInit() {
    this.loadShares();
  }

  typeIcon(type: string): string {
    switch (type) {
      case 'dashboard': return 'dashboard';
      case 'form': return 'edit_note';
      case 'workflow': return 'account_tree';
      default: return 'share';
    }
  }

  async copyLink(token: string) {
    const url = this.shareSvc.getShareUrl(token);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      (document as unknown as { execCommand(cmd: string): boolean }).execCommand('copy');
      ta.remove();
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }

  async revoke(share: ShareLink) {
    await this.shareSvc.revokeShare(share.token);
    this.myShares.update(list => list.filter(s => s.token !== share.token));
  }

  private async loadShares() {
    this.loading.set(true);
    try {
      const [my, withMe] = await Promise.all([
        this.shareSvc.listMyShares(),
        this.shareSvc.listSharedWithMe(),
      ]);
      this.myShares.set(my);
      this.sharedWithMe.set(withMe);
    } finally {
      this.loading.set(false);
    }
  }
}
