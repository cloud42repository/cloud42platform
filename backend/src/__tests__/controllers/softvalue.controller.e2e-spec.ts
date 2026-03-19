import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { SoftvalueController } from '../../softvalue/softvalue.controller';

describe('SoftvalueController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: SoftvalueController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<SoftvalueController>(SoftvalueController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Proxy ---
  it('GET /softvalue/proxy → proxyGet()', async () => {
    const result = await controller.proxyGet('/api/test', {});
    expect(result).toBeDefined();
  });

  it('POST /softvalue/proxy → proxyPost()', async () => {
    const result = await controller.proxyPost('/api/test', { key: 'value' });
    expect(result).toBeDefined();
  });

  it('PUT /softvalue/proxy → proxyPut()', async () => {
    const result = await controller.proxyPut('/api/test', { key: 'updated' });
    expect(result).toBeDefined();
  });

  it('PATCH /softvalue/proxy → proxyPatch()', async () => {
    const result = await controller.proxyPatch('/api/test', { key: 'patched' });
    expect(result).toBeDefined();
  });

  it('DELETE /softvalue/proxy → proxyDelete()', async () => {
    const result = await controller.proxyDelete('/api/test');
    expect(result).toBeDefined();
  });

  // --- Token ---
  it('POST /softvalue/token → updateToken()', async () => {
    const result = await controller.updateToken('test-token-value');
    expect(result).toBeUndefined();
  });

  it('GET /softvalue/token → getToken()', async () => {
    const result = await controller.getToken();
    expect(result).toBeDefined();
  });
});
