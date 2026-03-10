import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-cliq';

@Injectable({ providedIn: 'root' })
export class ZohoCliqService {
  private readonly api = inject(ApiService);

  // Channels
  listChannels(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/channels', {}, query);
  }
  getChannel(name: string) {
    return this.api.get(PREFIX, '/channels/:name', { name });
  }
  createChannel(body: unknown) {
    return this.api.post(PREFIX, '/channels', {}, body);
  }
  deleteChannel(name: string) {
    return this.api.delete(PREFIX, '/channels/:name', { name });
  }
  addChannelMember(name: string, body: unknown) {
    return this.api.post(PREFIX, '/channels/:name/members', { name }, body);
  }
  removeChannelMember(name: string, query: Record<string, string> = {}) {
    return this.api.delete(PREFIX, '/channels/:name/members', { name }, query);
  }
  listChannelMessages(name: string) {
    return this.api.get(PREFIX, '/channels/:name/messages', { name });
  }
  sendChannelMessage(name: string, body: unknown) {
    return this.api.post(PREFIX, '/channels/:name/messages', { name }, body);
  }
  deleteMessage(name: string, messageId: string) {
    return this.api.delete(PREFIX, '/channels/:name/messages/:messageId', { name, messageId });
  }

  // Direct Messages
  sendDirectMessage(email: string, body: unknown) {
    return this.api.post(PREFIX, '/direct/:email/messages', { email }, body);
  }

  // User Groups
  listUserGroups() {
    return this.api.get(PREFIX, '/usergroups');
  }
  getUserGroup(name: string) {
    return this.api.get(PREFIX, '/usergroups/:name', { name });
  }
  createUserGroup(body: unknown) {
    return this.api.post(PREFIX, '/usergroups', {}, body);
  }

  // Bots
  listBots() {
    return this.api.get(PREFIX, '/bots');
  }
  sendBotMessage(name: string, body: unknown) {
    return this.api.post(PREFIX, '/bots/:name/message', { name }, body);
  }
}
