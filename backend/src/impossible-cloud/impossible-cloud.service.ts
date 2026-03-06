import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImpossibleCloudClient } from './ImpossibleCloudClient';

@Injectable()
export class ImpossibleCloudService {
  readonly client: ImpossibleCloudClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ImpossibleCloudClient({
      apiKey: config.getOrThrow('IC_API_KEY'),
      baseUrl: config.get('IC_BASE_URL'),
    });
  }

  // Integrations
  listRegions() { return this.client.listRegions(); }

  // Contracts
  listContracts() { return this.client.listContracts(); }
  listContractPartners(contractId: string) { return this.client.listContractPartners(contractId); }

  // Partners
  createPartner(data: unknown) { return this.client.createPartner(data as any); }
  getPartner(partnerId: string) { return this.client.getPartner(partnerId); }
  updatePartner(partnerId: string, data: unknown) { return this.client.updatePartner(partnerId, data as any); }
  deletePartner(partnerId: string) { return this.client.deletePartner(partnerId); }

  // Members
  createMember(partnerId: string, data: unknown) { return this.client.createMember(partnerId, data as any); }
  deleteMember(partnerId: string, memberId: string) { return this.client.deleteMember(partnerId, memberId); }
  listMembers(partnerId: string) { return this.client.listMembers(partnerId); }

  // Partner Storage Accounts
  listPartnerStorageAccounts(partnerId: string) { return this.client.listPartnerStorageAccounts(partnerId); }
  createPartnerStorageAccount(partnerId: string, data: unknown) { return this.client.createPartnerStorageAccount(partnerId, data as any); }
  getPartnerStorageAccount(partnerId: string, accountId: string) { return this.client.getPartnerStorageAccount(partnerId, accountId); }
  deletePartnerStorageAccount(partnerId: string, accountId: string) { return this.client.deletePartnerStorageAccount(partnerId, accountId); }
  patchPartnerStorageAccount(partnerId: string, accountId: string, data: unknown) { return this.client.patchPartnerStorageAccount(partnerId, accountId, data as any); }

  // Partner / Account Usage
  getPartnerStorageAccountUsage(partnerId: string, accountId: string, params: Record<string, unknown>) { return this.client.getPartnerStorageAccountUsage(partnerId, accountId, params as any); }
  getPartnerUsage(partnerId: string, params: Record<string, unknown>) { return this.client.getPartnerUsage(partnerId, params as any); }

  // Own Storage Accounts
  createStorageAccount(data: unknown) { return this.client.createStorageAccount(data as any); }
  listStorageAccounts() { return this.client.listStorageAccounts(); }
  getStorageAccount(accountId: string) { return this.client.getStorageAccount(accountId); }
  deleteStorageAccount(accountId: string) { return this.client.deleteStorageAccount(accountId); }
  patchStorageAccount(accountId: string, data: unknown) { return this.client.patchStorageAccount(accountId, data as any); }
  getStorageAccountUsage(accountId: string, params: Record<string, unknown>) { return this.client.getStorageAccountUsage(accountId, params as any); }
  getAllStorageAccountsUsage(params: Record<string, unknown>) { return this.client.getAllStorageAccountsUsage(params as any); }
}
