import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  MailAccount,
  MailFolder,
  MailMessage, SendMessageDTO,
  MailContact, CreateMailContactDTO,
  MailListParams,
} from "./zoho-mail.dto";

export interface ZohoMailConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://mail.zoho.com/api */
  apiBaseUrl?: string;
}

/**
 * Zoho Mail API client.
 * Docs: https://www.zoho.com/mail/help/api/
 */
export class ZohoMailClient extends ZohoBaseClient {
  constructor(config: ZohoMailConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://mail.zoho.com/api",
    });
  }

  // â”€â”€â”€ Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listAccounts(): Promise<{ data: MailAccount[] }> {
    return this.get("/accounts");
  }
  getAccount(accountId: string): Promise<{ data: MailAccount }> {
    return this.get(`/accounts/${accountId}`);
  }

  // â”€â”€â”€ Folders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listFolders(accountId: string): Promise<{ data: MailFolder[] }> {
    return this.get(`/accounts/${accountId}/folders`);
  }

  // â”€â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listMessages(accountId: string, folderId: string, params?: MailListParams): Promise<{ data: MailMessage[] }> {
    return this.get(`/accounts/${accountId}/folders/${folderId}/messages`, { params });
  }
  getMessage(accountId: string, messageId: string): Promise<{ data: MailMessage }> {
    return this.get(`/accounts/${accountId}/messages/${messageId}`);
  }
  sendMessage(accountId: string, data: SendMessageDTO): Promise<{ data: { messageId: string } }> {
    return this.post(`/accounts/${accountId}/messages`, data);
  }
  deleteMessage(accountId: string, messageId: string): Promise<{ status: string }> {
    return this.delete(`/accounts/${accountId}/messages/${messageId}`);
  }
  moveMessage(accountId: string, messageId: string, targetFolderId: string): Promise<unknown> {
    return this.post(`/accounts/${accountId}/updatemessage`, {
      mode: "move",
      messageId,
      folderId: targetFolderId,
    });
  }
  markRead(accountId: string, messageId: string, isRead: boolean): Promise<unknown> {
    return this.post(`/accounts/${accountId}/updatemessage`, {
      mode: "markAsRead",
      messageId,
      isRead,
    });
  }
  searchMessages(accountId: string, searchKey: string, params?: MailListParams): Promise<{ data: MailMessage[] }> {
    return this.get(`/accounts/${accountId}/messages/search`, { params: { searchKey, ...params } });
  }

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listContacts(accountId: string): Promise<{ data: MailContact[] }> {
    return this.get(`/accounts/${accountId}/contacts`);
  }
  createContact(accountId: string, data: CreateMailContactDTO): Promise<{ data: MailContact }> {
    return this.post(`/accounts/${accountId}/contacts`, data);
  }
  deleteContact(accountId: string, contactId: string): Promise<unknown> {
    return this.delete(`/accounts/${accountId}/contacts/${contactId}`);
  }
}
