import { Test, TestingModule } from '@nestjs/testing';
import { ZohoWorkdriveController } from '../../zoho-workdrive/zoho-workdrive.controller';
import { ZohoWorkdriveService } from '../../zoho-workdrive/zoho-workdrive.service';

const mockService: Partial<ZohoWorkdriveService> = {};

describe('ZohoWorkdriveController', () => {
  let controller: ZohoWorkdriveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoWorkdriveController],
      providers: [{ provide: ZohoWorkdriveService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoWorkdriveController>(ZohoWorkdriveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
