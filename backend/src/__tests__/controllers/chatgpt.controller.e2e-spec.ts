import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ChatGPTController } from '../../chatgpt/chatgpt.controller';

describe('ChatGPTController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ChatGPTController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ChatGPTController>(ChatGPTController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Models ---
  it('GET /chatgpt/models → listModels()', async () => {
    const result = await controller.listModels();
    expect(result).toBeDefined();
  });

  it('GET /chatgpt/models/:modelId → getModel()', async () => {
    const result = await controller.getModel('gpt-4');
    expect(result).toBeDefined();
  });

  // --- Chat Completions ---
  it('POST /chatgpt/chat/completions → createChatCompletion()', async () => {
    const result = await controller.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    expect(result).toBeDefined();
  });

  // --- Embeddings ---
  it('POST /chatgpt/embeddings → createEmbedding()', async () => {
    const result = await controller.createEmbedding({
      model: 'text-embedding-ada-002',
      input: 'Test text for embedding',
    });
    expect(result).toBeDefined();
  });

  // --- Images ---
  it('POST /chatgpt/images/generations → generateImage()', async () => {
    const result = await controller.generateImage({
      prompt: 'A test image',
      n: 1,
      size: '256x256',
    });
    expect(result).toBeDefined();
  });

  // --- Moderations ---
  it('POST /chatgpt/moderations → createModeration()', async () => {
    const result = await controller.createModeration({
      input: 'This is a test input for moderation',
    });
    expect(result).toBeDefined();
  });
});
