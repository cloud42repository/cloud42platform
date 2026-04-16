import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { UserManagementService } from './user-management.service';

export type ShareItemType = 'dashboard' | 'form' | 'workflow';

export interface ShareLink {
  token: string;
  itemType: ShareItemType;
  itemId: string;
  ownerEmail: string;
  active: boolean;
  createdAt: string;
  sharedWithEmail?: string | null;
}

export interface SharedItemData {
  token: string;
  itemType: ShareItemType;
  itemId: string;
  data: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly api = inject(ApiService);
  private readonly userMgmt = inject(UserManagementService);
  private readonly API_PREFIX = '/shares';

  /** Create share links for a dashboard/form/workflow, optionally scoped to specific users */
  async createShare(itemType: ShareItemType, itemId: string, sharedWithEmails?: string[]): Promise<ShareLink[]> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) throw new Error('Not authenticated');
    const body: Record<string, unknown> = { itemType, itemId, ownerEmail: email };
    if (sharedWithEmails?.length) body['sharedWithEmails'] = sharedWithEmails;
    const res = await firstValueFrom(
      this.api.post(this.API_PREFIX, '', {}, body)
    );
    return res as ShareLink[];
  }

  /** Get the shareable URL for a token */
  getShareUrl(token: string): string {
    return `${globalThis.location.origin}/shared/${token}`;
  }

  /** Revoke a share link */
  async revokeShare(token: string): Promise<void> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return;
    await firstValueFrom(
      this.api.delete(this.API_PREFIX, '/:token', { token }, { ownerEmail: email })
    );
  }

  /** Resolve a public share token (no auth required) */
  async resolvePublic(token: string): Promise<SharedItemData> {
    const res = await firstValueFrom(
      this.api.get(this.API_PREFIX, '/public/:token', { token })
    );
    return res as SharedItemData;
  }

  /** List shares for current user */
  async listMyShares(): Promise<ShareLink[]> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return [];
    const res = await firstValueFrom(
      this.api.get(this.API_PREFIX, '', {}, { ownerEmail: email })
    );
    return res as ShareLink[];
  }

  /** List shares that others have shared with current user */
  async listSharedWithMe(): Promise<ShareLink[]> {
    const email = this.userMgmt.currentUser()?.email;
    if (!email) return [];
    const res = await firstValueFrom(
      this.api.get(this.API_PREFIX, '/shared-with-me', {}, { email })
    );
    return res as ShareLink[];
  }
}
