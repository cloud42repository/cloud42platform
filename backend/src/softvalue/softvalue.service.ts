import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { SoftvalueClient } from './SoftvalueClient';

@Injectable()
export class SoftvalueService {
  private readonly logger = new Logger(SoftvalueService.name);
  private readonly defaultClient: SoftvalueClient;
  private readonly clients = new Map<string, { client: SoftvalueClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new SoftvalueClient({
      token: config.getOrThrow('SOFTVALUE_TOKEN'),
      baseUrl: config.get('SOFTVALUE_BASE_URL'),
    });
  }

  private async getClient(): Promise<SoftvalueClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__softvalue__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['token']) {
          const client = new SoftvalueClient({
            token: c['token'] as string,
            baseUrl: (c['baseUrl'] as string) ?? this.config.get('SOFTVALUE_BASE_URL'),
            timeout: c['timeout'] ? Number(c['timeout']) : undefined,
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user Softvalue client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  async get<T = unknown>(path: string, config?: unknown): Promise<T> { return (await this.getClient()).get<T>(path, config as any); }
  async post<T = unknown>(path: string, data?: unknown): Promise<T> { return (await this.getClient()).post<T>(path, data); }
  async put<T = unknown>(path: string, data?: unknown): Promise<T> { return (await this.getClient()).put<T>(path, data); }
  async patch<T = unknown>(path: string, data?: unknown): Promise<T> { return (await this.getClient()).patch<T>(path, data); }
  async delete<T = unknown>(path: string): Promise<T> { return (await this.getClient()).delete<T>(path); }

  async updateToken(token: string): Promise<void> { (await this.getClient()).updateToken(token); }
  async getToken(): Promise<string> { return (await this.getClient()).getToken(); }
}
