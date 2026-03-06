import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoMailClient } from './ZohoMailClient';

@Injectable()
export class ZohoMailService {
  readonly client: ZohoMailClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoMailClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listAccounts() { return this.client.listAccounts(); }
  getAccount(accountId: string) { return this.client.getAccount(accountId); }

  listFolders(accountId: string) { return this.client.listFolders(accountId); }

  listMessages(accountId: string, folderId: string, params?: Record<string, unknown>) { return this.client.listMessages(accountId, folderId, params as any); }
  getMessage(accountId: string, messageId: string) { return this.client.getMessage(accountId, messageId); }
  sendMessage(accountId: string, data: unknown) { return this.client.sendMessage(accountId, data as any); }
  deleteMessage(accountId: string, messageId: string) { return this.client.deleteMessage(accountId, messageId); }
  moveMessage(accountId: string, messageId: string, targetFolderId: string) { return this.client.moveMessage(accountId, messageId, targetFolderId); }
  markRead(accountId: string, messageId: string, isRead: boolean) { return this.client.markRead(accountId, messageId, isRead); }
  searchMessages(accountId: string, searchKey: string, params?: Record<string, unknown>) { return this.client.searchMessages(accountId, searchKey, params as any); }

  listContacts(accountId: string) { return this.client.listContacts(accountId); }
  createContact(accountId: string, data: unknown) { return this.client.createContact(accountId, data as any); }
  deleteContact(accountId: string, contactId: string) { return this.client.deleteContact(accountId, contactId); }
}
