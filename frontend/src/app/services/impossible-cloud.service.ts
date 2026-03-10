import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/impossible-cloud';

@Injectable({ providedIn: 'root' })
export class ImpossibleCloudService {
  private readonly api = inject(ApiService);

  // Regions & Contracts
  listRegions() {
    return this.api.get(PREFIX, '/regions');
  }
  listContracts() {
    return this.api.get(PREFIX, '/contracts');
  }
  listContractPartners(contractId: string) {
    return this.api.get(PREFIX, '/contracts/:contractId/partners', { contractId });
  }

  // Partners
  createPartner(body: unknown) {
    return this.api.post(PREFIX, '/partners', {}, body);
  }
  getPartner(partnerId: string) {
    return this.api.get(PREFIX, '/partners/:partnerId', { partnerId });
  }
  updatePartner(partnerId: string, body: unknown) {
    return this.api.put(PREFIX, '/partners/:partnerId', { partnerId }, body);
  }
  deletePartner(partnerId: string) {
    return this.api.delete(PREFIX, '/partners/:partnerId', { partnerId });
  }

  // Members
  listMembers(partnerId: string) {
    return this.api.get(PREFIX, '/partners/:partnerId/members', { partnerId });
  }
  createMember(partnerId: string, body: unknown) {
    return this.api.post(PREFIX, '/partners/:partnerId/members', { partnerId }, body);
  }
  deleteMember(partnerId: string, memberId: string) {
    return this.api.delete(PREFIX, '/partners/:partnerId/members/:memberId', { partnerId, memberId });
  }

  // Partner Storage Accounts
  listPartnerStorageAccounts(partnerId: string) {
    return this.api.get(PREFIX, '/partners/:partnerId/storage-accounts', { partnerId });
  }
  createPartnerStorageAccount(partnerId: string, body: unknown) {
    return this.api.post(PREFIX, '/partners/:partnerId/storage-accounts', { partnerId }, body);
  }
  getPartnerStorageAccount(partnerId: string, accountId: string) {
    return this.api.get(PREFIX, '/partners/:partnerId/storage-accounts/:accountId', { partnerId, accountId });
  }
  deletePartnerStorageAccount(partnerId: string, accountId: string) {
    return this.api.delete(PREFIX, '/partners/:partnerId/storage-accounts/:accountId', { partnerId, accountId });
  }
  patchPartnerStorageAccount(partnerId: string, accountId: string, body: unknown) {
    return this.api.patch(PREFIX, '/partners/:partnerId/storage-accounts/:accountId', { partnerId, accountId }, body);
  }
  getPartnerStorageAccountUsage(partnerId: string, accountId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/partners/:partnerId/storage-accounts/:accountId/usage', { partnerId, accountId }, query);
  }
  getPartnerUsage(partnerId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/partners/:partnerId/usage', { partnerId }, query);
  }

  // Storage Accounts
  createStorageAccount(body: unknown) {
    return this.api.post(PREFIX, '/storage-accounts', {}, body);
  }
  listStorageAccounts() {
    return this.api.get(PREFIX, '/storage-accounts');
  }
  getAllStorageAccountsUsage(query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/storage-accounts/usage', {}, query);
  }
  getStorageAccount(accountId: string) {
    return this.api.get(PREFIX, '/storage-accounts/:accountId', { accountId });
  }
  deleteStorageAccount(accountId: string) {
    return this.api.delete(PREFIX, '/storage-accounts/:accountId', { accountId });
  }
  patchStorageAccount(accountId: string, body: unknown) {
    return this.api.patch(PREFIX, '/storage-accounts/:accountId', { accountId }, body);
  }
  getStorageAccountUsage(accountId: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/storage-accounts/:accountId/usage', { accountId }, query);
  }
}
