import { Test, TestingModule } from '@nestjs/testing';
import { ZohoProjectsController } from '../../zoho-projects/zoho-projects.controller';
import { ZohoProjectsService } from '../../zoho-projects/zoho-projects.service';

const mockService: Partial<ZohoProjectsService> = {};

describe('ZohoProjectsController', () => {
  let controller: ZohoProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoProjectsController],
      providers: [{ provide: ZohoProjectsService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoProjectsController>(ZohoProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
