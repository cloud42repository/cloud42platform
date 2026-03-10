import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-desk';

@Injectable({ providedIn: 'root' })
export class ZohoDeskService {
  private readonly api = inject(ApiService);

  // Tickets
  listTickets(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/tickets', {}, query);
  }
  searchTickets(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/tickets/search', {}, query);
  }
  getTicket(id: string) {
    return this.api.get(PREFIX, '/tickets/:id', { id });
  }
  createTicket(body: unknown) {
    return this.api.post(PREFIX, '/tickets', {}, body);
  }
  updateTicket(id: string, body: unknown) {
    return this.api.patch(PREFIX, '/tickets/:id', { id }, body);
  }
  deleteTicket(id: string) {
    return this.api.delete(PREFIX, '/tickets/:id', { id });
  }

  // Comments
  listComments(ticketId: string) {
    return this.api.get(PREFIX, '/tickets/:ticketId/comments', { ticketId });
  }
  addComment(ticketId: string, body: unknown) {
    return this.api.post(PREFIX, '/tickets/:ticketId/comments', { ticketId }, body);
  }
  deleteComment(ticketId: string, commentId: string) {
    return this.api.delete(PREFIX, '/tickets/:ticketId/comments/:commentId', { ticketId, commentId });
  }

  // Contacts
  listContacts(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/contacts', {}, query);
  }
  getContact(id: string) {
    return this.api.get(PREFIX, '/contacts/:id', { id });
  }
  createContact(body: unknown) {
    return this.api.post(PREFIX, '/contacts', {}, body);
  }
  updateContact(id: string, body: unknown) {
    return this.api.patch(PREFIX, '/contacts/:id', { id }, body);
  }
  deleteContact(id: string) {
    return this.api.delete(PREFIX, '/contacts/:id', { id });
  }

  // Agents
  listAgents(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/agents', {}, query);
  }
  getAgent(id: string) {
    return this.api.get(PREFIX, '/agents/:id', { id });
  }

  // Departments
  listDepartments() {
    return this.api.get(PREFIX, '/departments');
  }
  getDepartment(id: string) {
    return this.api.get(PREFIX, '/departments/:id', { id });
  }
}
