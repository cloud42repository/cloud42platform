import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SoftvalueClient } from './SoftvalueClient';

@Injectable()
export class SoftvalueService {
  readonly client: SoftvalueClient;

  constructor(private readonly config: ConfigService) {
    this.client = new SoftvalueClient({
      token: config.getOrThrow('SOFTVALUE_TOKEN'),
      baseUrl: config.get('SOFTVALUE_BASE_URL'),
    });
  }

  get<T = unknown>(path: string, config?: unknown): Promise<T> { return this.client.get<T>(path, config as any); }
  post<T = unknown>(path: string, data?: unknown): Promise<T> { return this.client.post<T>(path, data); }
  put<T = unknown>(path: string, data?: unknown): Promise<T> { return this.client.put<T>(path, data); }
  patch<T = unknown>(path: string, data?: unknown): Promise<T> { return this.client.patch<T>(path, data); }
  delete<T = unknown>(path: string): Promise<T> { return this.client.delete<T>(path); }

  updateToken(token: string): void { this.client.updateToken(token); }
  getToken(): string { return this.client.getToken(); }
}
