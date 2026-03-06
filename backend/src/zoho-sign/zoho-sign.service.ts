import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoSignClient } from './ZohoSignClient';

@Injectable()
export class ZohoSignService {
  readonly client: ZohoSignClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoSignClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listRequests(params?: Record<string, unknown>) { return this.client.listRequests(params as any); }
  getRequest(id: string) { return this.client.getRequest(id); }
  createRequest(data: unknown) { return this.client.createRequest(data as any); }
  sendRequest(id: string) { return this.client.sendRequest(id); }
  deleteRequest(id: string) { return this.client.deleteRequest(id); }
  recallRequest(id: string) { return this.client.recallRequest(id); }
  remindRequest(id: string) { return this.client.remindRequest(id); }

  listTemplates(params?: Record<string, unknown>) { return this.client.listTemplates(params as any); }
  getTemplate(id: string) { return this.client.getTemplate(id); }
  createRequestFromTemplate(templateId: string, recipientData: unknown) { return this.client.createRequestFromTemplate(templateId, recipientData); }

  getDocument(requestId: string, documentId: string) { return this.client.getDocument(requestId, documentId); }
  downloadDocument(requestId: string, documentId: string) { return this.client.downloadDocument(requestId, documentId); }
}
