import { Test, TestingModule } from '@nestjs/testing';
import { ZohoPeopleController } from '../../zoho-people/zoho-people.controller';
import { ZohoPeopleService } from '../../zoho-people/zoho-people.service';

const mockService: Partial<ZohoPeopleService> = {};

describe('ZohoPeopleController', () => {
  let controller: ZohoPeopleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoPeopleController],
      providers: [{ provide: ZohoPeopleService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoPeopleController>(ZohoPeopleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
