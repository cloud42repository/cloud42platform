import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { ZohoOAuthService } from '../zoho-oauth/zoho-oauth.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoPeopleClient } from './ZohoPeopleClient';

@Injectable()
export class ZohoPeopleService {
  private readonly logger = new Logger(ZohoPeopleService.name);
  private readonly defaultClient: ZohoPeopleClient;
  private readonly clients = new Map<string, { client: ZohoPeopleClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
    private readonly zohoOAuth: ZohoOAuthService,
  ) {
    this.defaultClient = new ZohoPeopleClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  private async getClient(): Promise<ZohoPeopleClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoPeopleClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho People client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listEmployees(params?: Record<string, unknown>) { return (await this.getClient()).listEmployees(params as any); }
  async getEmployee(id: string) { return (await this.getClient()).getEmployee(id); }
  async addEmployee(data: unknown) { return (await this.getClient()).addEmployee(data as any); }
  async updateEmployee(id: string, data: unknown) { return (await this.getClient()).updateEmployee(id, data as any); }
  async deleteEmployee(id: string) { return (await this.getClient()).deleteEmployee(id); }

  async listDepartments() { return (await this.getClient()).listDepartments(); }
  async listLeaveTypes() { return (await this.getClient()).listLeaveTypes(); }

  async listLeaveRequests(params?: Record<string, unknown>) { return (await this.getClient()).listLeaveRequests(params as any); }
  async addLeaveRequest(data: unknown) { return (await this.getClient()).addLeaveRequest(data as any); }
  async approveLeave(leaveId: string) { return (await this.getClient()).approveLeave(leaveId); }
  async rejectLeave(leaveId: string, reason?: string) { return (await this.getClient()).rejectLeave(leaveId, reason); }

  async listAttendance(empId: string, from?: string, to?: string) {
    return (await this.getClient()).listAttendance(empId, from && to ? { from, to } : undefined);
  }

  async getFormRecords(formName: string, params?: Record<string, unknown>) { return (await this.getClient()).getFormRecords(formName, params as any); }
  async addFormRecord(formName: string, data: Record<string, unknown>) { return (await this.getClient()).addFormRecord(formName, data); }
  async updateFormRecord(formName: string, recordId: string, data: Record<string, unknown>) { return (await this.getClient()).updateFormRecord(formName, recordId, data); }

  // ── OAuth lifecycle ──────────────────────────────────────────────────────
  getAuthUrl(scope: string) { return this.zohoOAuth.buildAuthorizationUrl({ scope }); }
  async exchangeGrantCode(code: string) {
    const result = await this.zohoOAuth.exchangeAndStore(code);
    const email = getCurrentUserEmail(); if (email) this.clients.delete(email);
    return result;
  }
  async revokeAuth() {
    const result = await this.zohoOAuth.revokeAndClear();
    const email = getCurrentUserEmail(); if (email) this.clients.delete(email);
    return result;
  }
}
