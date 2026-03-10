import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-campaigns';

@Injectable({ providedIn: 'root' })
export class ZohoCampaignsService {
  private readonly api = inject(ApiService);

  // Mailing Lists
  listMailingLists(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/lists', {}, query);
  }
  getMailingList(listKey: string) {
    return this.api.get(PREFIX, '/lists/:listKey', { listKey });
  }
  createMailingList(body: unknown) {
    return this.api.post(PREFIX, '/lists', {}, body);
  }
  deleteMailingList(listKey: string) {
    return this.api.delete(PREFIX, '/lists/:listKey', { listKey });
  }

  // Subscribers
  listSubscribers(listKey: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/lists/:listKey/subscribers', { listKey }, query);
  }
  addSubscriber(listKey: string, body: unknown) {
    return this.api.post(PREFIX, '/lists/:listKey/subscribers', { listKey }, body);
  }
  removeSubscriber(listKey: string, query: Record<string, string> = {}) {
    return this.api.delete(PREFIX, '/lists/:listKey/subscribers', { listKey }, query);
  }

  // Topics
  listTopics() {
    return this.api.get(PREFIX, '/topics');
  }

  // Campaigns
  listCampaigns(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/campaigns', {}, query);
  }
  getCampaign(campaignKey: string) {
    return this.api.get(PREFIX, '/campaigns/:campaignKey', { campaignKey });
  }
  sendCampaign(campaignKey: string) {
    return this.api.post(PREFIX, '/campaigns/:campaignKey/send', { campaignKey });
  }
  scheduleCampaign(campaignKey: string, body: unknown) {
    return this.api.post(PREFIX, '/campaigns/:campaignKey/schedule', { campaignKey }, body);
  }
}
