import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-creator';

@Injectable({ providedIn: 'root' })
export class ZohoCreatorService {
  private readonly api = inject(ApiService);

  // Applications
  listApplications() {
    return this.api.get(PREFIX, '/applications');
  }
  getApplication(appLinkName: string) {
    return this.api.get(PREFIX, '/applications/:appLinkName', { appLinkName });
  }

  // Forms
  listForms(appLinkName: string) {
    return this.api.get(PREFIX, '/applications/:appLinkName/forms', { appLinkName });
  }
  getForm(appLinkName: string, formLinkName: string) {
    return this.api.get(PREFIX, '/applications/:appLinkName/forms/:formLinkName', { appLinkName, formLinkName });
  }

  // Records
  listRecords(appLinkName: string, reportLinkName: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/applications/:appLinkName/reports/:reportLinkName/records', { appLinkName, reportLinkName }, query);
  }
  getRecord(appLinkName: string, reportLinkName: string, id: string) {
    return this.api.get(PREFIX, '/applications/:appLinkName/reports/:reportLinkName/records/:id', { appLinkName, reportLinkName, id });
  }
  createRecord(appLinkName: string, formLinkName: string, body: unknown) {
    return this.api.post(PREFIX, '/applications/:appLinkName/forms/:formLinkName/records', { appLinkName, formLinkName }, body);
  }
  updateRecord(appLinkName: string, reportLinkName: string, id: string, body: unknown) {
    return this.api.put(PREFIX, '/applications/:appLinkName/reports/:reportLinkName/records/:id', { appLinkName, reportLinkName, id }, body);
  }
  deleteRecord(appLinkName: string, reportLinkName: string, id: string) {
    return this.api.delete(PREFIX, '/applications/:appLinkName/reports/:reportLinkName/records/:id', { appLinkName, reportLinkName, id });
  }
  searchRecords(appLinkName: string, reportLinkName: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/applications/:appLinkName/reports/:reportLinkName/records/search', { appLinkName, reportLinkName }, query);
  }

  // Reports
  listReports(appLinkName: string) {
    return this.api.get(PREFIX, '/applications/:appLinkName/reports', { appLinkName });
  }

  // Workflows
  triggerWorkflow(appLinkName: string, workflowName: string, body: unknown) {
    return this.api.post(PREFIX, '/applications/:appLinkName/workflows/:workflowName', { appLinkName, workflowName }, body);
  }
}
