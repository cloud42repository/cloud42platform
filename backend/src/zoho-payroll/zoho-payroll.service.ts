import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ZohoPayrollClient } from './ZohoPayrollClient';

@Injectable()
export class ZohoPayrollService {
  private readonly logger = new Logger(ZohoPayrollService.name);
  private readonly defaultClient: ZohoPayrollClient;
  private readonly clients = new Map<string, { client: ZohoPayrollClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ZohoPayrollClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
      organizationId: config.get('ZOHO_ORGANIZATION_ID'),
    });
  }

  private async getClient(): Promise<ZohoPayrollClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__zoho__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['clientId'] && c['clientSecret']) {
          const client = new ZohoPayrollClient({
            clientId: c['clientId'] as string,
            clientSecret: c['clientSecret'] as string,
            refreshToken: (c['refreshToken'] as string) ?? this.config.getOrThrow('ZOHO_REFRESH_TOKEN'),
            accountsUrl: (c['accountsUrl'] as string) ?? this.config.get('ZOHO_ACCOUNTS_URL'),
            organizationId: this.config.get('ZOHO_ORGANIZATION_ID'),
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Zoho Payroll client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async listEmployees(params?: Record<string, unknown>) { return (await this.getClient()).listEmployees(params as any); }
  async getEmployee(id: string) { return (await this.getClient()).getEmployee(id); }
  async createEmployee(data: unknown) { return (await this.getClient()).createEmployee(data as any); }
  async updateEmployee(id: string, data: unknown) { return (await this.getClient()).updateEmployee(id, data as any); }
  async terminateEmployee(id: string, terminationDate: string, reason?: string) { return (await this.getClient()).terminateEmployee(id, terminationDate, reason); }

  async listPayComponents() { return (await this.getClient()).listPayComponents(); }
  async getPayComponent(id: string) { return (await this.getClient()).getPayComponent(id); }

  async listPayRuns(params?: Record<string, unknown>) { return (await this.getClient()).listPayRuns(params as any); }
  async getPayRun(id: string) { return (await this.getClient()).getPayRun(id); }
  async createPayRun(data: unknown) { return (await this.getClient()).createPayRun(data as any); }
  async approvePayRun(id: string) { return (await this.getClient()).approvePayRun(id); }

  async listPayslips(payRunId: string) { return (await this.getClient()).listPayslips(payRunId); }
  async getPayslip(payRunId: string, payslipId: string) { return (await this.getClient()).getPayslip(payRunId, payslipId); }

  async listDeclarations(params?: Record<string, unknown>) { return (await this.getClient()).listDeclarations(params as any); }
  async getDeclaration(id: string) { return (await this.getClient()).getDeclaration(id); }
}
