import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import { ChatGPTClient } from './ChatGPTClient';
import type {
  ChatCompletionRequest,
  EmbeddingRequest,
  ImageGenerateRequest,
  ModerationRequest,
} from './chatgpt.dto';

@Injectable()
export class ChatGPTService {
  private readonly logger = new Logger(ChatGPTService.name);
  private readonly defaultClient: ChatGPTClient;
  private readonly clients = new Map<string, { client: ChatGPTClient; expiresAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {
    this.defaultClient = new ChatGPTClient({
      apiKey: config.get('OPENAI_API_KEY') ?? 'sk-mock-placeholder',
      orgId: config.get('OPENAI_ORG_ID'),
      baseUrl: config.get('OPENAI_BASE_URL'),
    });
  }

  private async getClient(): Promise<ChatGPTClient> {
    const email = getCurrentUserEmail();
    if (!email || email === 'anonymous') return this.defaultClient;
    const cached = this.clients.get(email);
    if (cached && cached.expiresAt > Date.now()) return cached.client;
    try {
      const row = await this.authConfigService.findOne(email, '__chatgpt__');
      if (row?.config) {
        const c = row.config as unknown as Record<string, unknown>;
        if (c['apiKey']) {
          const client = new ChatGPTClient({
            apiKey: c['apiKey'] as string,
            orgId: (c['orgId'] as string) ?? this.config.get('OPENAI_ORG_ID'),
            baseUrl: (c['baseUrl'] as string) ?? this.config.get('OPENAI_BASE_URL'),
            timeout: c['timeout'] ? Number(c['timeout']) : undefined,
          });
          this.clients.set(email, { client, expiresAt: Date.now() + 10 * 60_000 });
          this.logger.log(`Created per-user ChatGPT client for ${email}`);
          return client;
        }
      }
    } catch { /* fall through */ }
    return this.defaultClient;
  }

  // Models
  async listModels() { return (await this.getClient()).listModels(); }
  async getModel(modelId: string) { return (await this.getClient()).getModel(modelId); }

  // Chat Completions
  async createChatCompletion(body: ChatCompletionRequest) { return (await this.getClient()).createChatCompletion(body); }

  // Embeddings
  async createEmbedding(body: EmbeddingRequest) { return (await this.getClient()).createEmbedding(body); }

  // Images
  async generateImage(body: ImageGenerateRequest) { return (await this.getClient()).generateImage(body); }

  // Moderations
  async createModeration(body: ModerationRequest) { return (await this.getClient()).createModeration(body); }
}
