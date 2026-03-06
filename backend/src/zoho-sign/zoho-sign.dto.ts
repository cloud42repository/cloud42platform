import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Document â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SignDocument {
  document_id?: string;
  document_name?: string;
  request_id?: string;
  created_time?: string;
  document_fields?: SignField[];
}

// â”€â”€â”€ Field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SignFieldType = "signature" | "initial" | "checkbox" | "text" | "date" | "radio";

export interface SignField {
  field_id?: string;
  field_name?: string;
  field_label?: string;
  field_type?: SignFieldType;
  page_no?: number;
  x_value?: string;
  y_value?: string;
  width?: string;
  height?: string;
  is_mandatory?: boolean;
  recipient_index?: number;
  default_value?: string;
}

// â”€â”€â”€ Recipient â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type RecipientRole = "signer" | "viewer" | "approver" | "in_person_signer";
export type RecipientStatus = "pending" | "signed" | "viewed" | "refused" | "expired";

export interface SignRecipient {
  recipient_id?: string;
  recipient_name?: string;
  recipient_email: string;
  role?: RecipientRole;
  signing_order?: number;
  status?: RecipientStatus;
  private_message?: string;
}

// â”€â”€â”€ Request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type RequestStatus = "inprogress" | "completed" | "declined" | "expired" | "draft" | "recalled";

export interface SignRequest {
  request_id?: string;
  request_name?: string;
  status?: RequestStatus;
  owner_id?: string;
  created_time?: string;
  expiration_days?: number;
  is_sequential?: boolean;
  notes?: string;
  documents?: SignDocument[];
  recipients?: SignRecipient[];
}

export interface CreateSignRequestDTO {
  request_name: string;
  expiration_days?: number;
  is_sequential?: boolean;
  notes?: string;
  send_reminder?: number;
  documents: {
    file_data?: string;
    file_name?: string;
    actions?: {
      recipient_name: string;
      recipient_email: string;
      role: RecipientRole;
      signing_order?: number;
      fields?: SignField[];
    }[];
  }[];
}

// â”€â”€â”€ Template â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SignTemplate {
  templates_id?: string;
  template_name?: string;
  owner_id?: string;
  created_time?: string;
  notes_to_signer?: string;
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface SignListParams extends ZohoListParams {
  status?: RequestStatus;
  search_text?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
