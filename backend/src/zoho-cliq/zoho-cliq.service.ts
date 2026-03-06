import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoCliqClient } from './ZohoCliqClient';

@Injectable()
export class ZohoCliqService {
  readonly client: ZohoCliqClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoCliqClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listChannels(params?: Record<string, unknown>) { return this.client.listChannels(params as any); }
  getChannel(uniqueName: string) { return this.client.getChannel(uniqueName); }
  createChannel(data: unknown) { return this.client.createChannel(data as any); }
  deleteChannel(uniqueName: string) { return this.client.deleteChannel(uniqueName); }
  addChannelMember(uniqueName: string, emails: string[]) { return this.client.addChannelMember(uniqueName, emails); }
  removeChannelMember(uniqueName: string, email: string) { return this.client.removeChannelMember(uniqueName, email); }

  listChannelMessages(uniqueName: string) { return this.client.listChannelMessages(uniqueName); }
  sendChannelMessage(uniqueName: string, data: unknown) { return this.client.sendChannelMessage(uniqueName, data as any); }
  sendDirectMessage(email: string, data: unknown) { return this.client.sendDirectMessage(email, data as any); }
  deleteMessage(channelUniqueName: string, messageId: string) { return this.client.deleteMessage(channelUniqueName, messageId); }

  listUserGroups() { return this.client.listUserGroups(); }
  getUserGroup(uniqueName: string) { return this.client.getUserGroup(uniqueName); }
  createUserGroup(data: unknown) { return this.client.createUserGroup(data as any); }

  listBots() { return this.client.listBots(); }
  sendBotMessage(botUniqueName: string, data: unknown) { return this.client.sendBotMessage(botUniqueName, data as any); }
}
