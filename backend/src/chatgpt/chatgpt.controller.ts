import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatGPTService } from './chatgpt.service';
import type {
  ChatCompletionRequest,
  EmbeddingRequest,
  ImageGenerateRequest,
  ModerationRequest,
} from './chatgpt.dto';

@Controller('chatgpt')
export class ChatGPTController {
  constructor(private readonly service: ChatGPTService) {}

  // ── Models ──────────────────────────────────────────────────────────────────

  @Get('models')
  listModels() {
    return this.service.listModels();
  }

  @Get('models/:modelId')
  getModel(@Param('modelId') modelId: string) {
    return this.service.getModel(modelId);
  }

  // ── Chat Completions ────────────────────────────────────────────────────────

  @Post('chat/completions')
  createChatCompletion(@Body() body: ChatCompletionRequest) {
    return this.service.createChatCompletion(body);
  }

  // ── Embeddings ──────────────────────────────────────────────────────────────

  @Post('embeddings')
  createEmbedding(@Body() body: EmbeddingRequest) {
    return this.service.createEmbedding(body);
  }

  // ── Images ──────────────────────────────────────────────────────────────────

  @Post('images/generations')
  generateImage(@Body() body: ImageGenerateRequest) {
    return this.service.generateImage(body);
  }

  // ── Moderations ─────────────────────────────────────────────────────────────

  @Post('moderations')
  createModeration(@Body() body: ModerationRequest) {
    return this.service.createModeration(body);
  }
}
