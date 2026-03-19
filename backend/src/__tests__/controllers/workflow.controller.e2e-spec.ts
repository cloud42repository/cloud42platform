import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { WorkflowController } from '../../workflow/workflow.controller';
import { UserController } from '../../user/user.controller';

const TEST_EMAIL = `e2e-wf-${Date.now()}@test.com`;

describe('WorkflowController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: WorkflowController;
  let userController: UserController;
  let createdId: string;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<WorkflowController>(WorkflowController);
    userController = moduleFixture.get<UserController>(UserController);

    // seed a test user (workflows have a FK to users)
    await userController.registerLogin({
      email: TEST_EMAIL,
      name: 'E2E Workflow User',
      photoUrl: 'https://example.com/photo.jpg',
    });
  });

  afterAll(async () => {
    // clean up: delete workflow then user
    try { if (createdId) await controller.remove(createdId); } catch {}
    try { await userController.remove(TEST_EMAIL); } catch {}
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /workflows → create()', async () => {
    const result = await controller.create({
      name: 'E2E Test Workflow',
      userEmail: TEST_EMAIL,
      steps: [{ type: 'noop' }],
    });
    expect(result).toBeDefined();
    createdId = result.id;
  });

  it('GET /workflows → findAll()', async () => {
    const result = await controller.findAll(TEST_EMAIL);
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('GET /workflows/:id → findOne()', async () => {
    const result = await controller.findOne(createdId);
    expect(result).toBeDefined();
    expect(result.id).toBe(createdId);
  });

  it('PUT /workflows/:id → update()', async () => {
    const result = await controller.update(createdId, {
      name: 'Updated Workflow',
    });
    expect(result).toBeDefined();
  });

  it('DELETE /workflows/:id → remove()', async () => {
    const result = await controller.remove(createdId);
    expect(result).toBeUndefined();
    createdId = ''; // prevent afterAll double-delete
  });
});
