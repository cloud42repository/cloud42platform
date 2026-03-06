import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoCRMClient } from './ZohoCRMClient';
import type { ZohoRegion } from '../base/types';

@Injectable()
export class ZohoCrmService {
  readonly client: ZohoCRMClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoCRMClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      region: (config.get<string>('ZOHO_REGION') as ZohoRegion) ?? 'com',
    });
  }

  // â”€â”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listLeads(params?: Record<string, unknown>) { return this.client.listLeads(params as any); }
  getLead(id: string) { return this.client.getLead(id); }
  createLeads(leads: unknown[]) { return this.client.createLeads(leads as any); }
  updateLeads(leads: unknown[]) { return this.client.updateLeads(leads as any); }
  deleteLead(id: string) { return this.client.deleteLead(id); }
  searchLeads(params: Record<string, unknown>) { return this.client.searchLeads(params as any); }

  // â”€â”€â”€ Contacts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listContacts(params?: Record<string, unknown>) { return this.client.listContacts(params as any); }
  getContact(id: string) { return this.client.getContact(id); }
  createContacts(contacts: unknown[]) { return this.client.createContacts(contacts as any); }
  updateContacts(contacts: unknown[]) { return this.client.updateContacts(contacts as any); }
  deleteContact(id: string) { return this.client.deleteContact(id); }
  searchContacts(params: Record<string, unknown>) { return this.client.searchContacts(params as any); }

  // â”€â”€â”€ Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listAccounts(params?: Record<string, unknown>) { return this.client.listAccounts(params as any); }
  getAccount(id: string) { return this.client.getAccount(id); }
  createAccounts(accounts: unknown[]) { return this.client.createAccounts(accounts as any); }
  updateAccounts(accounts: unknown[]) { return this.client.updateAccounts(accounts as any); }
  deleteAccount(id: string) { return this.client.deleteAccount(id); }

  // â”€â”€â”€ Deals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listDeals(params?: Record<string, unknown>) { return this.client.listDeals(params as any); }
  getDeal(id: string) { return this.client.getDeal(id); }
  createDeals(deals: unknown[]) { return this.client.createDeals(deals as any); }
  updateDeals(deals: unknown[]) { return this.client.updateDeals(deals as any); }
  deleteDeal(id: string) { return this.client.deleteDeal(id); }

  // â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listTasks(params?: Record<string, unknown>) { return this.client.listTasks(params as any); }
  getTask(id: string) { return this.client.getTask(id); }
  createTasks(tasks: unknown[]) { return this.client.createTasks(tasks as any); }
  updateTasks(tasks: unknown[]) { return this.client.updateTasks(tasks as any); }
  deleteTask(id: string) { return this.client.deleteTask(id); }

  // â”€â”€â”€ Notes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listNotes(params?: Record<string, unknown>) { return this.client.listNotes(params as any); }
  getNote(id: string) { return this.client.getNote(id); }
  createNotes(notes: unknown[]) { return this.client.createNotes(notes as any); }
  deleteNote(id: string) { return this.client.deleteNote(id); }

  // â”€â”€â”€ Generic module â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  listRecords(module: string, params?: Record<string, unknown>) { return this.client.listRecords(module, params as any); }
  getRecord(module: string, id: string) { return this.client.getRecord(module, id); }
  createRecords(module: string, data: unknown[]) { return this.client.createRecords(module, data as any); }
  updateRecords(module: string, data: unknown[]) { return this.client.updateRecords(module, data as any); }
  deleteRecord(module: string, id: string) { return this.client.deleteRecord(module, id); }
  searchRecords(module: string, params: Record<string, unknown>) { return this.client.searchRecords(module, params as any); }
}
