import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoCampaignsClient } from './ZohoCampaignsClient';

@Injectable()
export class ZohoCampaignsService {
  readonly client: ZohoCampaignsClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoCampaignsClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listMailingLists(params?: Record<string, unknown>) { return this.client.listMailingLists(params); }
  getMailingList(listKey: string) { return this.client.getMailingList(listKey); }
  createMailingList(data: unknown) { return this.client.createMailingList(data as any); }
  deleteMailingList(listKey: string) { return this.client.deleteMailingList(listKey); }

  listSubscribers(listKey: string, params?: Record<string, unknown>) { return this.client.listSubscribers(listKey, params); }
  addSubscriber(listKey: string, data: unknown) { return this.client.addSubscriber(listKey, data as any); }
  removeSubscriber(listKey: string, email: string) { return this.client.removeSubscriber(listKey, email); }

  listTopics() { return this.client.listTopics(); }

  listCampaigns(params?: Record<string, unknown>) { return this.client.listCampaigns(params); }
  getCampaign(campaignKey: string) { return this.client.getCampaign(campaignKey); }
  sendCampaign(campaignKey: string) { return this.client.sendCampaign(campaignKey); }
  scheduleCampaign(campaignKey: string, scheduleTime: string) { return this.client.scheduleCampaign(campaignKey, scheduleTime); }
}
