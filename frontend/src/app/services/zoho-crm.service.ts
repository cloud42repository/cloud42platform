import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-crm';

@Injectable({ providedIn: 'root' })
export class ZohoCrmService {
  private readonly api = inject(ApiService);

  // Leads
  listLeads(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/leads', {}, query);
  }
  searchLeads(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/leads/search', {}, query);
  }
  getLead(id: string) {
    return this.api.get(PREFIX, '/leads/:id', { id });
  }
  createLeads(data: unknown[]) {
    return this.api.post(PREFIX, '/leads', {}, { data });
  }
  updateLeads(data: unknown[]) {
    return this.api.put(PREFIX, '/leads', {}, { data });
  }
  deleteLead(id: string) {
    return this.api.delete(PREFIX, '/leads/:id', { id });
  }

  // Contacts
  listContacts(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/contacts', {}, query);
  }
  searchContacts(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/contacts/search', {}, query);
  }
  getContact(id: string) {
    return this.api.get(PREFIX, '/contacts/:id', { id });
  }
  createContacts(data: unknown[]) {
    return this.api.post(PREFIX, '/contacts', {}, { data });
  }
  updateContacts(data: unknown[]) {
    return this.api.put(PREFIX, '/contacts', {}, { data });
  }
  deleteContact(id: string) {
    return this.api.delete(PREFIX, '/contacts/:id', { id });
  }

  // Accounts
  listAccounts(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/accounts', {}, query);
  }
  getAccount(id: string) {
    return this.api.get(PREFIX, '/accounts/:id', { id });
  }
  createAccounts(data: unknown[]) {
    return this.api.post(PREFIX, '/accounts', {}, { data });
  }
  updateAccounts(data: unknown[]) {
    return this.api.put(PREFIX, '/accounts', {}, { data });
  }
  deleteAccount(id: string) {
    return this.api.delete(PREFIX, '/accounts/:id', { id });
  }

  // Deals
  listDeals(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/deals', {}, query);
  }
  getDeal(id: string) {
    return this.api.get(PREFIX, '/deals/:id', { id });
  }
  createDeals(data: unknown[]) {
    return this.api.post(PREFIX, '/deals', {}, { data });
  }
  updateDeals(data: unknown[]) {
    return this.api.put(PREFIX, '/deals', {}, { data });
  }
  deleteDeal(id: string) {
    return this.api.delete(PREFIX, '/deals/:id', { id });
  }

  // Tasks
  listTasks(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/tasks', {}, query);
  }
  getTask(id: string) {
    return this.api.get(PREFIX, '/tasks/:id', { id });
  }
  createTasks(data: unknown[]) {
    return this.api.post(PREFIX, '/tasks', {}, { data });
  }
  updateTasks(data: unknown[]) {
    return this.api.put(PREFIX, '/tasks', {}, { data });
  }
  deleteTask(id: string) {
    return this.api.delete(PREFIX, '/tasks/:id', { id });
  }

  // Notes
  listNotes(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/notes', {}, query);
  }
  getNote(id: string) {
    return this.api.get(PREFIX, '/notes/:id', { id });
  }
  createNotes(data: unknown[]) {
    return this.api.post(PREFIX, '/notes', {}, { data });
  }
  deleteNote(id: string) {
    return this.api.delete(PREFIX, '/notes/:id', { id });
  }

  // Generic module methods
  listRecords(module: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/modules/:module', { module }, query);
  }
  getRecord(module: string, id: string) {
    return this.api.get(PREFIX, '/modules/:module/:id', { module, id });
  }
  createRecords(module: string, data: unknown[]) {
    return this.api.post(PREFIX, '/modules/:module', { module }, { data });
  }
  updateRecords(module: string, data: unknown[]) {
    return this.api.put(PREFIX, '/modules/:module', { module }, { data });
  }
  deleteRecord(module: string, id: string) {
    return this.api.delete(PREFIX, '/modules/:module/:id', { module, id });
  }
  searchRecords(module: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/modules/:module/search', { module }, query);
  }
}
