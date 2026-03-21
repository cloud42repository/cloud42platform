import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  CreatorApplication,
  CreatorForm,
  CreatorField,
  CreatorRecord, CreateRecordDTO, UpdateRecordDTO,
  CreatorReport,
  CreatorWorkflow,
  CreatorListParams,
} from "./zoho-creator.dto";

export interface ZohoCreatorConfig extends ZohoCredentials {
  /** Your Zoho Creator account owner login name */
  ownerName?: string;
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://creator.zoho.com/api/v2 */
  apiBaseUrl?: string;
}

/**
 * Zoho Creator v2 API client.
 * Docs: https://www.zoho.com/creator/help/api/v2/
 */
export class ZohoCreatorClient extends ZohoBaseClient {
  private readonly ownerName?: string;

  constructor(config: ZohoCreatorConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://creator.zoho.com/api/v2",
    });
    this.ownerName = config.ownerName;
  }

  private ownerPath(path: string): string {
    return this.ownerName ? `/${this.ownerName}${path}` : path;
  }

  // â”€â”€â”€ Applications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listApplications(): Promise<{ applications: CreatorApplication[] }> {
    return this.get(this.ownerPath("/applications"));
  }
  getApplication(appLinkName: string): Promise<{ application: CreatorApplication }> {
    return this.get(this.ownerPath(`/applications/${appLinkName}`));
  }

  // â”€â”€â”€ Forms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listForms(appLinkName: string): Promise<{ forms: CreatorForm[] }> {
    return this.get(this.ownerPath(`/${appLinkName}/forms`));
  }
  getForm(appLinkName: string, formLinkName: string): Promise<{ form: CreatorForm }> {
    return this.get(this.ownerPath(`/${appLinkName}/forms/${formLinkName}`));
  }

  // â”€â”€â”€ Records â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listRecords(appLinkName: string, reportLinkName: string, params?: CreatorListParams): Promise<unknown> {
    return this.get(this.ownerPath(`/${appLinkName}/report/${reportLinkName}`), { params });
  }
  getRecord(appLinkName: string, reportLinkName: string, id: string): Promise<unknown> {
    return this.get(this.ownerPath(`/${appLinkName}/report/${reportLinkName}/${id}`));
  }
  createRecord(appLinkName: string, formLinkName: string, data: CreateRecordDTO): Promise<{ result: CreatorRecord }> {
    return this.post(this.ownerPath(`/${appLinkName}/form/${formLinkName}`), data);
  }
  updateRecord(appLinkName: string, reportLinkName: string, id: string, data: UpdateRecordDTO): Promise<unknown> {
    return this.patch(this.ownerPath(`/${appLinkName}/report/${reportLinkName}/${id}`), data);
  }
  deleteRecord(appLinkName: string, reportLinkName: string, id: string): Promise<unknown> {
    return this.delete(this.ownerPath(`/${appLinkName}/report/${reportLinkName}/${id}`));
  }
  searchRecords(appLinkName: string, reportLinkName: string, criteria: string, params?: CreatorListParams): Promise<unknown> {
    return this.get(this.ownerPath(`/${appLinkName}/report/${reportLinkName}`), {
      params: { criteria, ...params },
    });
  }

  // â”€â”€â”€ Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listReports(appLinkName: string): Promise<{ reports: CreatorReport[] }> {
    return this.get(this.ownerPath(`/${appLinkName}/reports`));
  }

  // â”€â”€â”€ Workflows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  triggerWorkflow(appLinkName: string, workflowName: string, data?: Record<string, unknown>): Promise<unknown> {
    return this.post(this.ownerPath(`/${appLinkName}/workflow/${workflowName}`), data ?? {});
  }
}
