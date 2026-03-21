import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials, ZOHO_API_BASE, ZohoRegion } from "../base/types";
import {
  CRMLead, CreateLeadDTO, UpdateLeadDTO,
  CRMContact, CreateCRMContactDTO, UpdateCRMContactDTO,
  CRMAccount, CreateAccountDTO, UpdateAccountDTO,
  CRMDeal, CreateDealDTO, UpdateDealDTO,
  CRMTask, CreateCRMTaskDTO, UpdateCRMTaskDTO,
  CRMNote, CreateNoteDTO,
  CRMSearchParams,
} from "./zoho-crm.dto";
import { ZohoListWrapper, ZohoBulkResponse } from "../shared/shared.dto";

export interface ZohoCRMConfig extends ZohoCredentials {
  /** Data-center region. Defaults to "com". */
  region?: ZohoRegion;
  organizationId?: string;
  /** Override the full API base URL instead of deriving it from region. */
  apiBaseUrl?: string;
}

/**
 * Zoho CRM v6 API client.
 * Docs: https://www.zoho.com/crm/developer/docs/api/v6/
 */
export class ZohoCRMClient extends ZohoBaseClient {
  constructor(config: ZohoCRMConfig) {
    const region = config.region ?? "com";
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? `${ZOHO_API_BASE[region]}/crm/v6`,
    });
  }

  // â”€â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listLeads(params?: CRMSearchParams): Promise<ZohoListWrapper<CRMLead>> {
    return this.get("/Leads", { params });
  }
  getLead(id: string): Promise<{ data: CRMLead[] }> {
    return this.get(`/Leads/${id}`);
  }
  createLeads(leads: CreateLeadDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Leads", { data: leads });
  }
  updateLeads(leads: (UpdateLeadDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/Leads", { data: leads });
  }
  deleteLead(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Leads/${id}`);
  }
  searchLeads(params: CRMSearchParams): Promise<ZohoListWrapper<CRMLead>> {
    return this.get("/Leads/search", { params });
  }

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listContacts(params?: CRMSearchParams): Promise<ZohoListWrapper<CRMContact>> {
    return this.get("/Contacts", { params });
  }
  getContact(id: string): Promise<{ data: CRMContact[] }> {
    return this.get(`/Contacts/${id}`);
  }
  createContacts(contacts: CreateCRMContactDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Contacts", { data: contacts });
  }
  updateContacts(contacts: (UpdateCRMContactDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/Contacts", { data: contacts });
  }
  deleteContact(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Contacts/${id}`);
  }
  searchContacts(params: CRMSearchParams): Promise<ZohoListWrapper<CRMContact>> {
    return this.get("/Contacts/search", { params });
  }

  // â”€â”€â”€ Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listAccounts(params?: CRMSearchParams): Promise<ZohoListWrapper<CRMAccount>> {
    return this.get("/Accounts", { params });
  }
  getAccount(id: string): Promise<{ data: CRMAccount[] }> {
    return this.get(`/Accounts/${id}`);
  }
  createAccounts(accounts: CreateAccountDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Accounts", { data: accounts });
  }
  updateAccounts(accounts: (UpdateAccountDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/Accounts", { data: accounts });
  }
  deleteAccount(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Accounts/${id}`);
  }

  // â”€â”€â”€ Deals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listDeals(params?: CRMSearchParams): Promise<ZohoListWrapper<CRMDeal>> {
    return this.get("/Deals", { params });
  }
  getDeal(id: string): Promise<{ data: CRMDeal[] }> {
    return this.get(`/Deals/${id}`);
  }
  createDeals(deals: CreateDealDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Deals", { data: deals });
  }
  updateDeals(deals: (UpdateDealDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/Deals", { data: deals });
  }
  deleteDeal(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Deals/${id}`);
  }

  // â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listTasks(params?: CRMSearchParams): Promise<ZohoListWrapper<CRMTask>> {
    return this.get("/Tasks", { params });
  }
  getTask(id: string): Promise<{ data: CRMTask[] }> {
    return this.get(`/Tasks/${id}`);
  }
  createTasks(tasks: CreateCRMTaskDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Tasks", { data: tasks });
  }
  updateTasks(tasks: (UpdateCRMTaskDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/Tasks", { data: tasks });
  }
  deleteTask(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Tasks/${id}`);
  }

  // â”€â”€â”€ Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listNotes(params?: CRMSearchParams): Promise<ZohoListWrapper<CRMNote>> {
    return this.get("/Notes", { params });
  }
  getNote(id: string): Promise<{ data: CRMNote[] }> {
    return this.get(`/Notes/${id}`);
  }
  createNotes(notes: CreateNoteDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Notes", { data: notes });
  }
  deleteNote(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Notes/${id}`);
  }

  // â”€â”€â”€ Generic module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listRecords<T = unknown>(module: string, params?: CRMSearchParams): Promise<ZohoListWrapper<T>> {
    return this.get(`/${module}`, { params });
  }
  getRecord<T = unknown>(module: string, id: string): Promise<{ data: T[] }> {
    return this.get(`/${module}/${id}`);
  }
  createRecords<T = unknown>(module: string, data: T[]): Promise<ZohoBulkResponse> {
    return this.post(`/${module}`, { data });
  }
  updateRecords<T = unknown>(module: string, data: (T & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put(`/${module}`, { data });
  }
  deleteRecord(module: string, id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/${module}/${id}`);
  }
  searchRecords<T = unknown>(module: string, params: CRMSearchParams): Promise<ZohoListWrapper<T>> {
    return this.get(`/${module}/search`, { params });
  }
}
