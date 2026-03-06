import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoRecruitClient } from './ZohoRecruitClient';

@Injectable()
export class ZohoRecruitService {
  readonly client: ZohoRecruitClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoRecruitClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listJobOpenings(params?: Record<string, unknown>) { return this.client.listJobOpenings(params as any); }
  getJobOpening(id: string) { return this.client.getJobOpening(id); }
  createJobOpenings(data: unknown[]) { return this.client.createJobOpenings(data as any); }
  updateJobOpenings(data: unknown[]) { return this.client.updateJobOpenings(data as any); }
  deleteJobOpening(id: string) { return this.client.deleteJobOpening(id); }

  listCandidates(params?: Record<string, unknown>) { return this.client.listCandidates(params as any); }
  getCandidate(id: string) { return this.client.getCandidate(id); }
  createCandidates(data: unknown[]) { return this.client.createCandidates(data as any); }
  updateCandidates(data: unknown[]) { return this.client.updateCandidates(data as any); }
  deleteCandidate(id: string) { return this.client.deleteCandidate(id); }
  searchCandidates(params: Record<string, unknown>) { return this.client.searchCandidates(params as any); }

  listInterviews(params?: Record<string, unknown>) { return this.client.listInterviews(params as any); }
  getInterview(id: string) { return this.client.getInterview(id); }
  createInterviews(data: unknown[]) { return this.client.createInterviews(data as any); }
  deleteInterview(id: string) { return this.client.deleteInterview(id); }

  listOffers(params?: Record<string, unknown>) { return this.client.listOffers(params as any); }
  getOffer(id: string) { return this.client.getOffer(id); }
}
