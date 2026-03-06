import { ZohoAddress, ZohoListWrapper, ZohoListParams, ZohoBulkResponse, ZohoLookup, ZohoSingleWrapper } from "../shared/shared.dto";

// â”€â”€â”€ Common â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMOwner {
  id: string;
  name: string;
  email: string;
}

// â”€â”€â”€ Lead â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMLead {
  id: string;
  First_Name?: string;
  Last_Name: string;
  Email?: string;
  Phone?: string;
  Company?: string;
  Lead_Source?: string;
  Lead_Status?: string;
  Owner?: CRMOwner;
  Created_Time?: string;
  Modified_Time?: string;
  [key: string]: unknown;
}

export type CreateLeadDTO = Omit<CRMLead, "id" | "Created_Time" | "Modified_Time">;
export type UpdateLeadDTO = Partial<CreateLeadDTO>;

// â”€â”€â”€ Contact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMContact {
  id: string;
  First_Name?: string;
  Last_Name: string;
  Email?: string;
  Phone?: string;
  Account_Name?: ZohoLookup;
  Owner?: CRMOwner;
  Mailing_Address?: ZohoAddress;
  Created_Time?: string;
  Modified_Time?: string;
  [key: string]: unknown;
}

export type CreateCRMContactDTO = Omit<CRMContact, "id" | "Created_Time" | "Modified_Time">;
export type UpdateCRMContactDTO = Partial<CreateCRMContactDTO>;

// â”€â”€â”€ Account â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMAccount {
  id: string;
  Account_Name: string;
  Website?: string;
  Phone?: string;
  Industry?: string;
  Billing_Address?: ZohoAddress;
  Owner?: CRMOwner;
  Created_Time?: string;
  Modified_Time?: string;
  [key: string]: unknown;
}

export type CreateAccountDTO = Omit<CRMAccount, "id" | "Created_Time" | "Modified_Time">;
export type UpdateAccountDTO = Partial<CreateAccountDTO>;

// â”€â”€â”€ Deal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMDeal {
  id: string;
  Deal_Name: string;
  Stage: string;
  Amount?: number;
  Closing_Date?: string;
  Account_Name?: ZohoLookup;
  Contact_Name?: ZohoLookup;
  Owner?: CRMOwner;
  Probability?: number;
  Created_Time?: string;
  Modified_Time?: string;
  [key: string]: unknown;
}

export type CreateDealDTO = Omit<CRMDeal, "id" | "Created_Time" | "Modified_Time">;
export type UpdateDealDTO = Partial<CreateDealDTO>;

// â”€â”€â”€ Task â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMTask {
  id: string;
  Subject: string;
  Status?: "Not Started" | "In Progress" | "Completed" | "Waiting for input" | "Deferred";
  Priority?: "High" | "Highest" | "Low" | "Lowest" | "Normal";
  Due_Date?: string;
  Owner?: CRMOwner;
  Who_Id?: ZohoLookup;
  What_Id?: ZohoLookup;
  Description?: string;
  Created_Time?: string;
  Modified_Time?: string;
}

export type CreateCRMTaskDTO = Omit<CRMTask, "id" | "Created_Time" | "Modified_Time">;
export type UpdateCRMTaskDTO = Partial<CreateCRMTaskDTO>;

// â”€â”€â”€ Note â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMNote {
  id: string;
  Note_Title?: string;
  Note_Content: string;
  Parent_Id?: ZohoLookup;
  se_module?: string;
  Created_Time?: string;
  Modified_Time?: string;
}

export type CreateNoteDTO = Omit<CRMNote, "id" | "Created_Time" | "Modified_Time">;
export type UpdateNoteDTO = Partial<CreateNoteDTO>;

// â”€â”€â”€ Module field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMModuleField {
  api_name: string;
  data_type: string;
  display_label: string;
  required: boolean;
  read_only: boolean;
}

// â”€â”€â”€ Search criteria â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CRMSearchParams extends ZohoListParams {
  criteria?: string;   // e.g. "(Last_Name:equals:Smith)"
  email?: string;
  phone?: string;
  word?: string;
}

// â”€â”€â”€ Re-exports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type { ZohoListWrapper, ZohoListParams, ZohoBulkResponse, ZohoSingleWrapper };
