import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { AuthController } from '../../auth-module/auth.controller';

describe('AuthController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: AuthController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<AuthController>(AuthController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const mockRes = { cookie: jest.fn(), clearCookie: jest.fn() } as any;

  it('POST /auth/login → login()', async () => {
    await expect(
      controller.login({ idToken: 'test-google-id-token' }, mockRes),
    ).rejects.toBeDefined();
  });

  it('POST /auth/dev-login → devLogin()', async () => {
    const result = await controller.devLogin(
      { email: 'e2e@test.com', name: 'E2E Tester' },
      mockRes,
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty('accessToken');
  });

  it('POST /auth/refresh → refresh()', async () => {
    const mockReq = { cookies: {} } as any;
    await expect(
      controller.refresh(mockReq, mockRes),
    ).rejects.toThrow('No refresh token');
  });

  it('POST /auth/logout → logout()', async () => {
    const mockReq = { user: { sub: 'e2e@test.com' } } as any;
    const result = await controller.logout(mockReq, mockRes);
    expect(result).toEqual({ ok: true });
  });
});
