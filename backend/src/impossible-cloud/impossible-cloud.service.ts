import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ImpossibleCloudClient } from './ImpossibleCloudClient';

@Injectable()
export class ImpossibleCloudService {
  private readonly logger = new Logger(ImpossibleCloudService.name);
  private readonly defaultClient: ImpossibleCloudClient;
  private readonly clients = new Map<string, { client: ImpossibleCloudClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ImpossibleCloudClient({
      apiKey: config.getOrThrow('IC_API_KEY'),
      baseUrl: config.get('IC_BASE_URL'),
    });
  }

  private async getClient(): Promise<ImpossibleCloudClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__impossible-cloud__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['apiKey']) {
          const client = new ImpossibleCloudClient({
            apiKey: c['apiKey'] as string,
            baseUrl: (c['baseUrl'] as string) ?? this.config.get('IC_BASE_URL'),
            timeout: c['timeout'] ? Number(c['timeout']) : undefined,
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Impossible Cloud client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  // Integrations
  async listRegions() { return (await this.getClient()).listRegions(); }

  // Contracts
  async listContracts() { return (await this.getClient()).listContracts(); }
  async listContractPartners(contractId: string) { return (await this.getClient()).listContractPartners(contractId); }

  // Partners
  async createPartner(data: unknown) { return (await this.getClient()).createPartner(data as any); }
  async getPartner(partnerId: string) { return (await this.getClient()).getPartner(partnerId); }
  async updatePartner(partnerId: string, data: unknown) { return (await this.getClient()).updatePartner(partnerId, data as any); }
  async deletePartner(partnerId: string) { return (await this.getClient()).deletePartner(partnerId); }

  // Members
  async createMember(partnerId: string, data: unknown) { return (await this.getClient()).createMember(partnerId, data as any); }
  async deleteMember(partnerId: string, memberId: string) { return (await this.getClient()).deleteMember(partnerId, memberId); }
  async listMembers(partnerId: string) { return (await this.getClient()).listMembers(partnerId); }

  // Partner Storage Accounts
  async listPartnerStorageAccounts(partnerId: string) { return (await this.getClient()).listPartnerStorageAccounts(partnerId); }
  async createPartnerStorageAccount(partnerId: string, data: unknown) { return (await this.getClient()).createPartnerStorageAccount(partnerId, data as any); }
  async getPartnerStorageAccount(partnerId: string, accountId: string) { return (await this.getClient()).getPartnerStorageAccount(partnerId, accountId); }
  async deletePartnerStorageAccount(partnerId: string, accountId: string) { return (await this.getClient()).deletePartnerStorageAccount(partnerId, accountId); }
  async patchPartnerStorageAccount(partnerId: string, accountId: string, data: unknown) { return (await this.getClient()).patchPartnerStorageAccount(partnerId, accountId, data as any); }

  // Partner / Account Usage
  async getPartnerStorageAccountUsage(partnerId: string, accountId: string, params: Record<string, unknown>) { return (await this.getClient()).getPartnerStorageAccountUsage(partnerId, accountId, params as any); }
  async getPartnerUsage(partnerId: string, params: Record<string, unknown>) { return (await this.getClient()).getPartnerUsage(partnerId, params as any); }

  // Own Storage Accounts
  async createStorageAccount(data: unknown) { return (await this.getClient()).createStorageAccount(data as any); }
  async listStorageAccounts() { return (await this.getClient()).listStorageAccounts(); }
  async getStorageAccount(accountId: string) { return (await this.getClient()).getStorageAccount(accountId); }
  async deleteStorageAccount(accountId: string) { return (await this.getClient()).deleteStorageAccount(accountId); }
  async patchStorageAccount(accountId: string, data: unknown) { return (await this.getClient()).patchStorageAccount(accountId, data as any); }
  async getStorageAccountUsage(accountId: string, params: Record<string, unknown>) { return (await this.getClient()).getStorageAccountUsage(accountId, params as any); }
  async getAllStorageAccountsUsage(params: Record<string, unknown>) { return (await this.getClient()).getAllStorageAccountsUsage(params as any); }
}
