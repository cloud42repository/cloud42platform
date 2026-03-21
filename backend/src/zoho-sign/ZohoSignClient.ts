import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  SignRequest, CreateSignRequestDTO,
  SignTemplate,
  SignDocument,
  SignListParams,
} from "./zoho-sign.dto";

export interface ZohoSignConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://sign.zoho.com/api/v1 */
  apiBaseUrl?: string;
}

/**
 * Zoho Sign v1 API client.
 * Docs: https://www.zoho.com/sign/api/
 */
export class ZohoSignClient extends ZohoBaseClient {
  constructor(config: ZohoSignConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://sign.zoho.com/api/v1",
    });
  }

  // â”€â”€â”€ Requests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listRequests(params?: SignListParams): Promise<{ requests: SignRequest[]; page_context?: unknown }> {
    return this.get("/requests", { params });
  }
  getRequest(id: string): Promise<{ requests: SignRequest }> {
    return this.get(`/requests/${id}`);
  }
  createRequest(data: CreateSignRequestDTO): Promise<{ requests: SignRequest }> {
    return this.post("/requests", { requests: data });
  }
  sendRequest(id: string): Promise<{ requests: SignRequest }> {
    return this.post(`/requests/${id}/submit`, {});
  }
  deleteRequest(id: string): Promise<{ message: string }> {
    return this.delete(`/requests/${id}`);
  }
  recallRequest(id: string): Promise<{ requests: SignRequest }> {
    return this.post(`/requests/${id}/recall`, {});
  }
  remindRequest(id: string): Promise<{ message: string }> {
    return this.post(`/requests/${id}/remind`, {});
  }

  // â”€â”€â”€ Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTemplates(params?: SignListParams): Promise<{ templates: SignTemplate[] }> {
    return this.get("/templates", { params });
  }
  getTemplate(id: string): Promise<{ templates: SignTemplate }> {
    return this.get(`/templates/${id}`);
  }
  createRequestFromTemplate(templateId: string, recipientData: unknown): Promise<{ requests: SignRequest }> {
    return this.post(`/templates/${templateId}/createdocument`, recipientData);
  }

  // â”€â”€â”€ Documents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  getDocument(requestId: string, documentId: string): Promise<{ document: SignDocument }> {
    return this.get(`/requests/${requestId}/documents/${documentId}`);
  }
  downloadDocument(requestId: string, documentId: string): Promise<Buffer> {
    return this.get(`/requests/${requestId}/documents/${documentId}/pdf`, {
      responseType: "arraybuffer",
    });
  }
}
