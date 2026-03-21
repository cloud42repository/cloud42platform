import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  CampaignMailingList, CreateMailingListDTO,
  CampaignSubscriber, AddSubscriberDTO,
  Campaign, CreateCampaignDTO, UpdateCampaignDTO,
  CampaignTopic,
  CampaignsListParams,
} from "./zoho-campaigns.dto";

export interface ZohoCampaignsConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://campaigns.zoho.com/api/v1.1 */
  apiBaseUrl?: string;
}

/**
 * Zoho Campaigns v1.1 API client.
 * Docs: https://www.zoho.com/campaigns/help/api/index.html
 */
export class ZohoCampaignsClient extends ZohoBaseClient {
  constructor(config: ZohoCampaignsConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://campaigns.zoho.com/api/v1.1",
    });
  }

  // â”€â”€â”€ Mailing Lists â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listMailingLists(params?: CampaignsListParams): Promise<unknown> {
    return this.get("/getmailinglists", { params: { resfmt: "JSON", ...params } });
  }
  getMailingList(listKey: string): Promise<unknown> {
    return this.get("/list/listDetails", { params: { resfmt: "JSON", listkey: listKey } });
  }
  createMailingList(data: CreateMailingListDTO): Promise<unknown> {
    return this.post("/addList", { ...data, resfmt: "JSON" });
  }
  deleteMailingList(listKey: string): Promise<unknown> {
    return this.post("/deleteList", { listkey: listKey, resfmt: "JSON" });
  }

  // â”€â”€â”€ Subscribers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listSubscribers(listKey: string, params?: CampaignsListParams): Promise<unknown> {
    return this.get("/list/listsubscribers", { params: { resfmt: "JSON", listkey: listKey, ...params } });
  }
  addSubscriber(listKey: string, data: AddSubscriberDTO): Promise<unknown> {
    return this.post("/json/listsubscribe", { listkey: listKey, resfmt: "JSON", contactinfo: JSON.stringify(data) });
  }
  removeSubscriber(listKey: string, email: string): Promise<unknown> {
    return this.post("/json/listunsubscribe", { listkey: listKey, emailids: email, resfmt: "JSON" });
  }

  // â”€â”€â”€ Topics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTopics(): Promise<unknown> {
    return this.get("/topicList", { params: { resfmt: "JSON" } });
  }

  // â”€â”€â”€ Campaigns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCampaigns(params?: CampaignsListParams): Promise<unknown> {
    return this.get("/getallmailings", { params: { resfmt: "JSON", ...params } });
  }
  getCampaign(campaignKey: string): Promise<unknown> {
    return this.get("/getmailingdetails", { params: { resfmt: "JSON", campaignkey: campaignKey } });
  }
  sendCampaign(campaignKey: string): Promise<unknown> {
    return this.post("/sendEmail", { campaignkey: campaignKey, resfmt: "JSON" });
  }
  scheduleCampaign(campaignKey: string, scheduleTime: string): Promise<unknown> {
    return this.post("/schedulecampaign", { campaignkey: campaignKey, schedule_time: scheduleTime, resfmt: "JSON" });
  }
}
