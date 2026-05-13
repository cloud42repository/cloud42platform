# zoho-cliq.dto.ts

TypeScript interfaces and types defining data structures for the Zoho Cliq module. Covers channels, messages, user groups, bots, and list parameters.

## Key Exports

- **ChannelType** — Union type: "public" | "private" | "commercial"
- **CliqChannel** / **CreateChannelDTO** — Channel entity and create DTO
- **AttachmentType** — Union type: "image" | "file" | "video" | "audio"
- **CliqAttachment** — Attachment structure for messages
- **CliqMessage** / **SendCliqMessageDTO** — Message entity and send DTO
- **CliqUserGroup** / **CreateUserGroupDTO** — User group entity and create DTO
- **CliqBot** — Bot entity interface
- **CliqListParams** — Extended list parameters with type and search filters

## Dependencies

- `ZohoListParams` from `../shared/shared.dto` — Base pagination/list parameters

## How It Works

Provides pure TypeScript type definitions organized by resource type (channels, messages, user groups, bots). Each section defines an entity interface and corresponding create DTO. `CliqListParams` extends the shared base params with Cliq-specific filters for channel type and text search. Message DTOs support text, bot attribution, attachments, and pin status.
