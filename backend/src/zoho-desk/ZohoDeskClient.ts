import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  DeskTicket, CreateTicketDTO, UpdateTicketDTO,
  DeskComment, CreateCommentDTO,
  DeskContact, CreateDeskContactDTO, UpdateDeskContactDTO,
  DeskAgent,
  DeskDepartment,
  DeskListParams,
} from "./zoho-desk.dto";

export interface ZohoDeskConfig extends ZohoCredentials {
  /** Override the full API base URL. Defaults to https://desk.zoho.com/api/v1 */
  apiBaseUrl?: string;
}

/**
 * Zoho Desk v1 API client.
 * Docs: https://desk.zoho.com/DeskAPIDocument
 */
export class ZohoDeskClient extends ZohoBaseClient {
  constructor(config: ZohoDeskConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://desk.zoho.com/api/v1",
    });
  }

  // â”€â”€â”€ Tickets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTickets(params?: DeskListParams): Promise<{ data: DeskTicket[] }> {
    return this.get("/tickets", { params });
  }
  getTicket(id: string): Promise<DeskTicket> {
    return this.get(`/tickets/${id}`);
  }
  createTicket(data: CreateTicketDTO): Promise<DeskTicket> {
    return this.post("/tickets", data);
  }
  updateTicket(id: string, data: UpdateTicketDTO): Promise<DeskTicket> {
    return this.patch(`/tickets/${id}`, data);
  }
  deleteTicket(id: string): Promise<void> {
    return this.delete(`/tickets/${id}`);
  }
  searchTickets(params: DeskListParams): Promise<{ data: DeskTicket[] }> {
    return this.get("/tickets/search", { params });
  }

  // â”€â”€â”€ Comments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listComments(ticketId: string): Promise<{ data: DeskComment[] }> {
    return this.get(`/tickets/${ticketId}/comments`);
  }
  addComment(ticketId: string, data: CreateCommentDTO): Promise<DeskComment> {
    return this.post(`/tickets/${ticketId}/comments`, data);
  }
  deleteComment(ticketId: string, commentId: string): Promise<void> {
    return this.delete(`/tickets/${ticketId}/comments/${commentId}`);
  }

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listContacts(params?: DeskListParams): Promise<{ data: DeskContact[] }> {
    return this.get("/contacts", { params });
  }
  getContact(id: string): Promise<DeskContact> {
    return this.get(`/contacts/${id}`);
  }
  createContact(data: CreateDeskContactDTO): Promise<DeskContact> {
    return this.post("/contacts", data);
  }
  updateContact(id: string, data: UpdateDeskContactDTO): Promise<DeskContact> {
    return this.patch(`/contacts/${id}`, data);
  }
  deleteContact(id: string): Promise<void> {
    return this.delete(`/contacts/${id}`);
  }

  // â”€â”€â”€ Agents â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listAgents(params?: DeskListParams): Promise<{ data: DeskAgent[] }> {
    return this.get("/agents", { params });
  }
  getAgent(id: string): Promise<DeskAgent> {
    return this.get(`/agents/${id}`);
  }

  // â”€â”€â”€ Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listDepartments(): Promise<{ data: DeskDepartment[] }> {
    return this.get("/departments");
  }
  getDepartment(id: string): Promise<DeskDepartment> {
    return this.get(`/departments/${id}`);
  }
}
