import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoCreatorClient } from './ZohoCreatorClient';

@Injectable()
export class ZohoCreatorService {
  readonly client: ZohoCreatorClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoCreatorClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      ownerName: config.get('ZOHO_CREATOR_OWNER_NAME'),
    });
  }

  listApplications() { return this.client.listApplications(); }
  getApplication(appLinkName: string) { return this.client.getApplication(appLinkName); }

  listForms(appLinkName: string) { return this.client.listForms(appLinkName); }
  getForm(appLinkName: string, formLinkName: string) { return this.client.getForm(appLinkName, formLinkName); }

  listRecords(appLinkName: string, reportLinkName: string, params?: Record<string, unknown>) { return this.client.listRecords(appLinkName, reportLinkName, params as any); }
  getRecord(appLinkName: string, reportLinkName: string, id: string) { return this.client.getRecord(appLinkName, reportLinkName, id); }
  createRecord(appLinkName: string, formLinkName: string, data: unknown) { return this.client.createRecord(appLinkName, formLinkName, data as any); }
  updateRecord(appLinkName: string, reportLinkName: string, id: string, data: unknown) { return this.client.updateRecord(appLinkName, reportLinkName, id, data as any); }
  deleteRecord(appLinkName: string, reportLinkName: string, id: string) { return this.client.deleteRecord(appLinkName, reportLinkName, id); }
  searchRecords(appLinkName: string, reportLinkName: string, criteria: string, params?: Record<string, unknown>) { return this.client.searchRecords(appLinkName, reportLinkName, criteria, params as any); }

  listReports(appLinkName: string) { return this.client.listReports(appLinkName); }
  triggerWorkflow(appLinkName: string, workflowName: string, data?: Record<string, unknown>) { return this.client.triggerWorkflow(appLinkName, workflowName, data); }
}
