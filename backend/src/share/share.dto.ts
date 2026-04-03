import type { ShareItemType } from './share.entity';

/** POST /api/shares — create a share link */
export interface CreateShareDto {
  itemType: ShareItemType;
  itemId: string;
  ownerEmail: string;
}

/** Response DTO */
export interface ShareResponseDto {
  token: string;
  itemType: ShareItemType;
  itemId: string;
  ownerEmail: string;
  active: boolean;
  createdAt: string;
}

/** GET /api/shares/:token — public response with item data inlined */
export interface SharedItemResponseDto {
  token: string;
  itemType: ShareItemType;
  itemId: string;
  data: unknown;
}
