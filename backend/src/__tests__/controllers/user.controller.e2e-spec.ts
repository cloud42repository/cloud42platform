import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { UserController } from '../../user/user.controller';

const TEST_EMAIL = `e2e-user-${Date.now()}@test.com`;

describe('UserController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: UserController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<UserController>(UserController);

    // seed a test user for subsequent tests
    await controller.registerLogin({
      email: TEST_EMAIL,
      name: 'E2E Test User',
      photoUrl: 'https://example.com/photo.jpg',
    });
  });

  afterAll(async () => {
    // clean up test user (ignore errors if already removed)
    try { await controller.remove(TEST_EMAIL); } catch {}
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /users → findAll()', async () => {
    const result = await controller.findAll();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('GET /users/:email → findOne()', async () => {
    const result = await controller.findOne(TEST_EMAIL);
    expect(result).toBeDefined();
    expect(result.email).toBe(TEST_EMAIL);
  });

  it('POST /users/login → registerLogin()', async () => {
    const result = await controller.registerLogin({
      email: TEST_EMAIL,
      name: 'E2E Test User Updated',
      photoUrl: 'https://example.com/photo2.jpg',
    });
    expect(result).toBeDefined();
  });

  it('PATCH /users/:email/role → setRole()', async () => {
    const result = await controller.setRole(TEST_EMAIL, { role: 'user' });
    expect(result).toBeDefined();
  });

  it('PATCH /users/:email/module-visibility → setModuleVisibility()', async () => {
    const result = await controller.setModuleVisibility(TEST_EMAIL, {
      moduleId: 'zoho-crm',
      enabled: true,
    });
    expect(result).toBeDefined();
  });

  it('PATCH /users/:email/modules-bulk → setAllModulesEnabled()', async () => {
    const result = await controller.setAllModulesEnabled(TEST_EMAIL, {
      moduleIds: ['zoho-crm', 'zoho-books'],
      enabled: true,
    });
    expect(result).toBeDefined();
  });

  it('DELETE /users/:email → remove()', async () => {
    const result = await controller.remove(TEST_EMAIL);
    expect(result).toBeUndefined();
  });
});
