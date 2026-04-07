import type { ShareItemType } from './share.entity';

/** POST /api/shares — create a share link */
export interface CreateShareDto {
  itemType: ShareItemType;
  itemId: string;
  ownerEmail: string;
  /** If provided, the share is restricted to these user emails */
  sharedWithEmails?: string[];
}

/** Response DTO */
export interface ShareResponseDto {
  token: string;
  itemType: ShareItemType;
  itemId: string;
  ownerEmail: string;
  active: boolean;
  createdAt: string;
  sharedWithEmail?: string | null;
}

/** GET /api/shares/:token — public response with item data inlined */
export interface SharedItemResponseDto {
  token: string;
  itemType: ShareItemType;
  itemId: string;
  data: unknown;
}
