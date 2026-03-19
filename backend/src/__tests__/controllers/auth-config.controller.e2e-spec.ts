import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AuthConfigController } from '../../auth-config/auth-config.controller';

describe('AuthConfigController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: AuthConfigController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<AuthConfigController>(AuthConfigController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockReq = { user: { sub: 'test@test.com', role: 'admin' } } as any;

  it('GET /auth-configs → findAll()', async () => {
    const result = await controller.findAll(mockReq);
    expect(result).toBeDefined();
  });

  it('GET /auth-configs/:moduleId → findOne()', async () => {
    const result = await controller.findOne(mockReq, '__zoho__');
    expect(result).toBeDefined();
  });

  it('PUT /auth-configs/:moduleId → save()', async () => {
    const result = await controller.save(mockReq, '__zoho__', {
      config: { type: 'oauth', clientId: 'test', clientSecret: 'test', refreshToken: 'test' },
    });
    expect(result).toBeDefined();
  });

  it('DELETE /auth-configs/:moduleId → remove()', async () => {
    const result = await controller.remove(mockReq, '__zoho__');
    expect(result).toBeUndefined();
  });

  it('GET /auth-configs/admin/:userEmail → adminFindAll()', async () => {
    const result = await controller.adminFindAll('test@test.com');
    expect(result).toBeDefined();
  });
});
