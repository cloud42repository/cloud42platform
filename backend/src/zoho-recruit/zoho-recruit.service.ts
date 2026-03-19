import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoRecruitClient } from './ZohoRecruitClient';

@Injectable()
export class ZohoRecruitService {
  private readonly logger = new Logger(ZohoRecruitService.name);
  private readonly defaultClient: ZohoRecruitClient;
  private readonly clients = new Map<string, { client: ZohoRecruitClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoRecruitClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoRecruitClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoRecruitClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Recruit client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listJobOpenings(params?: Record<string, unknown>) { return (await this.getClient()).listJobOpenings(params as any); }
  async getJobOpening(id: string) { return (await this.getClient()).getJobOpening(id); }
  async createJobOpenings(data: unknown[]) { return (await this.getClient()).createJobOpenings(data as any); }
  async updateJobOpenings(data: unknown[]) { return (await this.getClient()).updateJobOpenings(data as any); }
  async deleteJobOpening(id: string) { return (await this.getClient()).deleteJobOpening(id); }

  async listCandidates(params?: Record<string, unknown>) { return (await this.getClient()).listCandidates(params as any); }
  async getCandidate(id: string) { return (await this.getClient()).getCandidate(id); }
  async createCandidates(data: unknown[]) { return (await this.getClient()).createCandidates(data as any); }
  async updateCandidates(data: unknown[]) { return (await this.getClient()).updateCandidates(data as any); }
  async deleteCandidate(id: string) { return (await this.getClient()).deleteCandidate(id); }
  async searchCandidates(params: Record<string, unknown>) { return (await this.getClient()).searchCandidates(params as any); }

  async listInterviews(params?: Record<string, unknown>) { return (await this.getClient()).listInterviews(params as any); }
  async getInterview(id: string) { return (await this.getClient()).getInterview(id); }
  async createInterviews(data: unknown[]) { return (await this.getClient()).createInterviews(data as any); }
  async deleteInterview(id: string) { return (await this.getClient()).deleteInterview(id); }

  async listOffers(params?: Record<string, unknown>) { return (await this.getClient()).listOffers(params as any); }
  async getOffer(id: string) { return (await this.getClient()).getOffer(id); }
}
