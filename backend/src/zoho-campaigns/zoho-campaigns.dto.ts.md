# zoho-campaigns.dto.ts

TypeScript interfaces and types defining data structures for the Zoho Campaigns module. Covers mailing lists, subscribers, campaigns, topics, and list parameters.

## Key Exports

- **CampaignMailingList** / **CreateMailingListDTO** — Mailing list entity and create DTO
- **SubscriberStatus** — Union type: "active" | "unsub" | "bounced" | "spam"
- **CampaignSubscriber** / **AddSubscriberDTO** — Subscriber entity and add DTO
- **CampaignStatus** — Union type: "draft" | "scheduled" | "queue" | "sent" | "archived"
- **CampaignType** — Union type: "regular" | "ab_test" | "automated" | "ecomm"
- **Campaign** / **CreateCampaignDTO** / **UpdateCampaignDTO** — Campaign entity and DTOs
- **CampaignTopic** — Topic entity interface
- **CampaignsListParams** — Extended list parameters with status, type, and search filters

## Dependencies

- `ZohoListParams` from `../shared/shared.dto` — Base pagination/list parameters

## How It Works

Provides pure TypeScript type definitions organized by resource (mailing lists, subscribers, campaigns, topics). `CampaignsListParams` extends the shared base with campaign-specific filtering options. The subscriber interface uses an index signature to support custom fields.
