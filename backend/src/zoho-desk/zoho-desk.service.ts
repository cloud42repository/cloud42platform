import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoDeskClient } from './ZohoDeskClient';

@Injectable()
export class ZohoDeskService {
  readonly client: ZohoDeskClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoDeskClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listTickets(params?: Record<string, unknown>) { return this.client.listTickets(params as any); }
  getTicket(id: string) { return this.client.getTicket(id); }
  createTicket(data: unknown) { return this.client.createTicket(data as any); }
  updateTicket(id: string, data: unknown) { return this.client.updateTicket(id, data as any); }
  deleteTicket(id: string) { return this.client.deleteTicket(id); }
  searchTickets(params: Record<string, unknown>) { return this.client.searchTickets(params as any); }

  listComments(ticketId: string) { return this.client.listComments(ticketId); }
  addComment(ticketId: string, data: unknown) { return this.client.addComment(ticketId, data as any); }
  deleteComment(ticketId: string, commentId: string) { return this.client.deleteComment(ticketId, commentId); }

  listContacts(params?: Record<string, unknown>) { return this.client.listContacts(params as any); }
  getContact(id: string) { return this.client.getContact(id); }
  createContact(data: unknown) { return this.client.createContact(data as any); }
  updateContact(id: string, data: unknown) { return this.client.updateContact(id, data as any); }
  deleteContact(id: string) { return this.client.deleteContact(id); }

  listAgents(params?: Record<string, unknown>) { return this.client.listAgents(params as any); }
  getAgent(id: string) { return this.client.getAgent(id); }

  listDepartments() { return this.client.listDepartments(); }
  getDepartment(id: string) { return this.client.getDepartment(id); }
}
