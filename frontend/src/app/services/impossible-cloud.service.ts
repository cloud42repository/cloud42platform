import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type {
  ICListRegionsResponse,
  ICContract,
  ICPartner,
  ICCreatePartnerDTO,
  ICUpdatePartnerDTO,
  ICMember,
  ICCreateMemberDTO,
  ICStorageAccount,
  ICCreateStorageAccountDTO,
  ICPatchStorageAccountDTO,
  ICClientUsage,
  ICUsageParams,
} from './impossible-cloud.types';

const PREFIX = '/impossible-cloud';

@Injectable({ providedIn: 'root' })
export class ImpossibleCloudService {
  private readonly api = inject(ApiService);

  // ── Regions & Contracts ─────────────────────────────────────────────────────

  listRegions(): Observable<ICListRegionsResponse> {
    return this.api.get(PREFIX, '/regions') as Observable<ICListRegionsResponse>;
  }

  listContracts(): Observable<ICContract[]> {
    return this.api.get(PREFIX, '/contracts') as Observable<ICContract[]>;
  }

  listContractPartners(contractId: string): Observable<ICPartner[]> {
    return this.api.get(PREFIX, '/contracts/:contractId/partners', { contractId }) as Observable<ICPartner[]>;
  }

  // ── Partners ────────────────────────────────────────────────────────────────

  createPartner(body: ICCreatePartnerDTO): Observable<ICPartner> {
    return this.api.post(PREFIX, '/partners', {}, body) as Observable<ICPartner>;
  }

  getPartner(partnerId: string): Observable<ICPartner> {
    return this.api.get(PREFIX, '/partners/:partnerId', { partnerId }) as Observable<ICPartner>;
  }

  updatePartner(partnerId: string, body: ICUpdatePartnerDTO): Observable<ICPartner> {
    return this.api.put(PREFIX, '/partners/:partnerId', { partnerId }, body) as Observable<ICPartner>;
  }

  deletePartner(partnerId: string): Observable<void> {
    return this.api.delete(PREFIX, '/partners/:partnerId', { partnerId }) as Observable<void>;
  }

  // ── Members ─────────────────────────────────────────────────────────────────

  listMembers(partnerId: string): Observable<ICMember[]> {
    return this.api.get(PREFIX, '/partners/:partnerId/members', { partnerId }) as Observable<ICMember[]>;
  }

  createMember(partnerId: string, body: ICCreateMemberDTO): Observable<ICMember> {
    return this.api.post(PREFIX, '/partners/:partnerId/members', { partnerId }, body) as Observable<ICMember>;
  }

  deleteMember(partnerId: string, memberId: string): Observable<void> {
    return this.api.delete(PREFIX, '/partners/:partnerId/members/:memberId', { partnerId, memberId }) as Observable<void>;
  }

  // ── Partner Storage Accounts ────────────────────────────────────────────────

  listPartnerStorageAccounts(partnerId: string): Observable<ICStorageAccount[]> {
    return this.api.get(PREFIX, '/partners/:partnerId/storage-accounts', { partnerId }) as Observable<ICStorageAccount[]>;
  }

  createPartnerStorageAccount(partnerId: string, body: ICCreateStorageAccountDTO): Observable<ICStorageAccount> {
    return this.api.post(PREFIX, '/partners/:partnerId/storage-accounts', { partnerId }, body) as Observable<ICStorageAccount>;
  }

  getPartnerStorageAccount(partnerId: string, accountId: string): Observable<ICStorageAccount> {
    return this.api.get(PREFIX, '/partners/:partnerId/storage-accounts/:accountId', { partnerId, accountId }) as Observable<ICStorageAccount>;
  }

  deletePartnerStorageAccount(partnerId: string, accountId: string): Observable<void> {
    return this.api.delete(PREFIX, '/partners/:partnerId/storage-accounts/:accountId', { partnerId, accountId }) as Observable<void>;
  }

  patchPartnerStorageAccount(partnerId: string, accountId: string, body: ICPatchStorageAccountDTO): Observable<ICStorageAccount> {
    return this.api.patch(PREFIX, '/partners/:partnerId/storage-accounts/:accountId', { partnerId, accountId }, body) as Observable<ICStorageAccount>;
  }

  getPartnerStorageAccountUsage(partnerId: string, accountId: string, query: ICUsageParams): Observable<ICClientUsage> {
    return this.api.get(PREFIX, '/partners/:partnerId/storage-accounts/:accountId/usage', { partnerId, accountId }, { ...query }) as Observable<ICClientUsage>;
  }

  getPartnerUsage(partnerId: string, query: ICUsageParams): Observable<ICClientUsage[]> {
    return this.api.get(PREFIX, '/partners/:partnerId/usage', { partnerId }, { ...query }) as Observable<ICClientUsage[]>;
  }

  // ── Own Storage Accounts ────────────────────────────────────────────────────

  createStorageAccount(body: ICCreateStorageAccountDTO): Observable<ICStorageAccount> {
    return this.api.post(PREFIX, '/storage-accounts', {}, body) as Observable<ICStorageAccount>;
  }

  listStorageAccounts(): Observable<ICStorageAccount[]> {
    return this.api.get(PREFIX, '/storage-accounts') as Observable<ICStorageAccount[]>;
  }

  getAllStorageAccountsUsage(query: ICUsageParams): Observable<ICClientUsage[]> {
    return this.api.get(PREFIX, '/storage-accounts/usage', {}, { ...query }) as Observable<ICClientUsage[]>;
  }

  getStorageAccount(accountId: string): Observable<ICStorageAccount> {
    return this.api.get(PREFIX, '/storage-accounts/:accountId', { accountId }) as Observable<ICStorageAccount>;
  }

  deleteStorageAccount(accountId: string): Observable<void> {
    return this.api.delete(PREFIX, '/storage-accounts/:accountId', { accountId }) as Observable<void>;
  }

  patchStorageAccount(accountId: string, body: ICPatchStorageAccountDTO): Observable<ICStorageAccount> {
    return this.api.patch(PREFIX, '/storage-accounts/:accountId', { accountId }, body) as Observable<ICStorageAccount>;
  }

  getStorageAccountUsage(accountId: string, query: ICUsageParams): Observable<ICClientUsage> {
    return this.api.get(PREFIX, '/storage-accounts/:accountId/usage', { accountId }, { ...query }) as Observable<ICClientUsage>;
  }
}
