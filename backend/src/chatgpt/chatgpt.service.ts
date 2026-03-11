import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGPTClient } from './ChatGPTClient';
import type {
  ChatCompletionRequest,
  EmbeddingRequest,
  ImageGenerateRequest,
  ModerationRequest,
} from './chatgpt.dto';

@Injectable()
export class ChatGPTService {
  readonly client: ChatGPTClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ChatGPTClient({
      apiKey: config.get('OPENAI_API_KEY') ?? 'sk-mock-placeholder',
      orgId: config.get('OPENAI_ORG_ID'),
      baseUrl: config.get('OPENAI_BASE_URL'),
    });
  }

  // Models
  listModels() { return this.client.listModels(); }
  getModel(modelId: string) { return this.client.getModel(modelId); }

  // Chat Completions
  createChatCompletion(body: ChatCompletionRequest) { return this.client.createChatCompletion(body); }

  // Embeddings
  createEmbedding(body: EmbeddingRequest) { return this.client.createEmbedding(body); }

  // Images
  generateImage(body: ImageGenerateRequest) { return this.client.generateImage(body); }

  // Moderations
  createModeration(body: ModerationRequest) { return this.client.createModeration(body); }
}
