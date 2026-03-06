import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Mailing List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CampaignMailingList {
  listkey?: string;
  listname?: string;
  description?: string;
  signup_page?: string;
  type?: "email" | "contact";
}

export interface CreateMailingListDTO {
  listname: string;
  description?: string;
  signup_formname?: string;
}

// â”€â”€â”€ Subscriber â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SubscriberStatus = "active" | "unsub" | "bounced" | "spam";

export interface CampaignSubscriber {
  contact_email?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  status?: SubscriberStatus;
  listkey?: string;
  contactid?: string;
  [key: string]: unknown;
}

export interface AddSubscriberDTO {
  email: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  [key: string]: unknown;
}

// â”€â”€â”€ Campaign â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CampaignStatus = "draft" | "scheduled" | "queue" | "sent" | "archived";
export type CampaignType = "regular" | "ab_test" | "automated" | "ecomm";

export interface Campaign {
  campaignid?: string;
  campaigntopic?: string;
  campstatus?: CampaignStatus;
  camptype?: CampaignType;
  created_time?: string;
  sent_time?: string;
  from_email?: string;
  from_name?: string;
  subject?: string;
  listkeys?: string[];
  totalsent?: number;
  opens?: number;
  clicks?: number;
}

export interface CreateCampaignDTO {
  campaigntopic: string;
  from_email: string;
  from_name?: string;
  reply_to?: string;
  subject: string;
  listkeys: string[];
  camptype?: CampaignType;
  html_body?: string;
  text_body?: string;
}

export type UpdateCampaignDTO = Partial<CreateCampaignDTO>;

// â”€â”€â”€ Topic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CampaignTopic {
  topicid?: string;
  topicname?: string;
  description?: string;
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CampaignsListParams extends ZohoListParams {
  status?: CampaignStatus;
  type?: CampaignType;
  search?: string;
}
