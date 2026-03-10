import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-sign';

@Injectable({ providedIn: 'root' })
export class ZohoSignService {
  private readonly api = inject(ApiService);

  // Requests
  listRequests(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/requests', {}, query);
  }
  getRequest(id: string) {
    return this.api.get(PREFIX, '/requests/:id', { id });
  }
  createRequest(body: unknown) {
    return this.api.post(PREFIX, '/requests', {}, body);
  }
  sendRequest(id: string) {
    return this.api.post(PREFIX, '/requests/:id/send', { id });
  }
  deleteRequest(id: string) {
    return this.api.delete(PREFIX, '/requests/:id', { id });
  }
  recallRequest(id: string) {
    return this.api.post(PREFIX, '/requests/:id/recall', { id });
  }
  remindRequest(id: string) {
    return this.api.post(PREFIX, '/requests/:id/remind', { id });
  }

  // Templates
  listTemplates(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/templates', {}, query);
  }
  getTemplate(id: string) {
    return this.api.get(PREFIX, '/templates/:id', { id });
  }
  createRequestFromTemplate(id: string, body: unknown) {
    return this.api.post(PREFIX, '/templates/:id/create-request', { id }, body);
  }

  // Documents
  getDocument(requestId: string, documentId: string) {
    return this.api.get(PREFIX, '/requests/:requestId/documents/:documentId', { requestId, documentId });
  }
  downloadDocument(requestId: string, documentId: string) {
    return this.api.get(PREFIX, '/requests/:requestId/documents/:documentId/download', { requestId, documentId });
  }
}
