import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { SchemaController } from '../../schema/schema.controller';

describe('SchemaController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: SchemaController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<SchemaController>(SchemaController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /schema → getSchema()', () => {
    const result = controller.getSchema();
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });
});
