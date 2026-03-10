import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-mail';

@Injectable({ providedIn: 'root' })
export class ZohoMailService {
  private readonly api = inject(ApiService);

  // Accounts
  listAccounts() {
    return this.api.get(PREFIX, '/accounts');
  }
  getAccount(accountId: string) {
    return this.api.get(PREFIX, '/accounts/:accountId', { accountId });
  }

  // Folders
  listFolders(accountId: string) {
    return this.api.get(PREFIX, '/accounts/:accountId/folders', { accountId });
  }

  // Messages
  listMessages(accountId: string, folderId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/accounts/:accountId/folders/:folderId/messages', { accountId, folderId }, query);
  }
  searchMessages(accountId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/accounts/:accountId/messages/search', { accountId }, query);
  }
  getMessage(accountId: string, messageId: string) {
    return this.api.get(PREFIX, '/accounts/:accountId/messages/:messageId', { accountId, messageId });
  }
  sendMessage(accountId: string, body: unknown) {
    return this.api.post(PREFIX, '/accounts/:accountId/messages', { accountId }, body);
  }
  deleteMessage(accountId: string, messageId: string) {
    return this.api.delete(PREFIX, '/accounts/:accountId/messages/:messageId', { accountId, messageId });
  }
  moveMessage(accountId: string, messageId: string, body: unknown) {
    return this.api.post(PREFIX, '/accounts/:accountId/messages/:messageId/move', { accountId, messageId }, body);
  }
  markRead(accountId: string, messageId: string, body: unknown) {
    return this.api.post(PREFIX, '/accounts/:accountId/messages/:messageId/read', { accountId, messageId }, body);
  }

  // Contacts
  listContacts(accountId: string) {
    return this.api.get(PREFIX, '/accounts/:accountId/contacts', { accountId });
  }
  createContact(accountId: string, body: unknown) {
    return this.api.post(PREFIX, '/accounts/:accountId/contacts', { accountId }, body);
  }
  deleteContact(accountId: string, contactId: string) {
    return this.api.delete(PREFIX, '/accounts/:accountId/contacts/:contactId', { accountId, contactId });
  }
}
