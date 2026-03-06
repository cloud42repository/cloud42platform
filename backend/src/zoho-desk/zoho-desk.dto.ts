import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Ticket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type TicketStatus = "Open" | "On Hold" | "Escalated" | "Closed" | "Resolved";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type TicketChannel = "Email" | "Twitter" | "Facebook" | "Web" | "Phone" | "Chat" | "API";

export interface DeskTicket {
  id?: string;
  ticketNumber?: string;
  subject: string;
  contact?: { id: string; firstName?: string; lastName?: string; email?: string };
  account?: { id: string; name?: string };
  departmentId?: string;
  assigneeId?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  channel?: TicketChannel;
  description?: string;
  dueDate?: string;
  closedTime?: string;
  createdTime?: string;
  modifiedTime?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export interface CreateTicketDTO {
  subject: string;
  departmentId: string;
  contactId?: string;
  accountId?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  description?: string;
  dueDate?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  customFields?: Record<string, unknown>;
}

export type UpdateTicketDTO = Partial<CreateTicketDTO>;

// â”€â”€â”€ Comment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DeskComment {
  id?: string;
  ticketId?: string;
  authorId?: string;
  content: string;
  contentType?: "plainText" | "html";
  isPublic?: boolean;
  createdTime?: string;
}

export interface CreateCommentDTO {
  content: string;
  isPublic?: boolean;
  contentType?: "plainText" | "html";
}

// â”€â”€â”€ Contact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DeskContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  accountId?: string;
  description?: string;
  type?: "contact" | "lead";
  createdTime?: string;
}

export interface CreateDeskContactDTO {
  lastName: string;
  firstName?: string;
  email?: string;
  phone?: string;
  accountId?: string;
}

export type UpdateDeskContactDTO = Partial<CreateDeskContactDTO>;

// â”€â”€â”€ Agent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DeskAgent {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  type?: "agent" | "light_agent";
  status?: "active" | "inactive";
}

// â”€â”€â”€ Department â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DeskDepartment {
  id?: string;
  name?: string;
  isDefault?: boolean;
  associatedChannels?: TicketChannel[];
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface DeskListParams extends ZohoListParams {
  status?: string;
  priority?: TicketPriority;
  departmentId?: string;
  assigneeId?: string;
  channel?: TicketChannel;
  searchStr?: string;
  sortBy?: string;
}
