import { Test, TestingModule } from '@nestjs/testing';
import { ZohoDeskController } from '../../zoho-desk/zoho-desk.controller';
import { ZohoDeskService } from '../../zoho-desk/zoho-desk.service';

const mockService: Partial<ZohoDeskService> = {};

describe('ZohoDeskController', () => {
  let controller: ZohoDeskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoDeskController],
      providers: [{ provide: ZohoDeskService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoDeskController>(ZohoDeskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
