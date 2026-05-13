# share.dto.ts

Data Transfer Object interfaces for the share module, defining request and response shapes for share-link operations.

## Key Exports

- **CreateShareDto** — Payload for creating share links (itemType, itemId, ownerEmail, optional sharedWithEmails array)
- **ShareResponseDto** — Standard response for share metadata (token, itemType, itemId, ownerEmail, active, createdAt, sharedWithEmail)
- **SharedItemResponseDto** — Response for public token resolution, containing the token, item metadata, and the resolved item `data`

## Dependencies

- `ShareItemType` — Type import from `share.entity`

## How It Works

Pure TypeScript interfaces. `CreateShareDto` supports both public links (no `sharedWithEmails`) and user-targeted shares (one or more emails). `ShareResponseDto` represents the share record metadata. `SharedItemResponseDto` wraps the full resolved item data for the public share viewer endpoint.
