import { Test, TestingModule } from '@nestjs/testing';
import { ZohoPayrollController } from '../../zoho-payroll/zoho-payroll.controller';
import { ZohoPayrollService } from '../../zoho-payroll/zoho-payroll.service';

const mockService: Partial<ZohoPayrollService> = {};

describe('ZohoPayrollController', () => {
  let controller: ZohoPayrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoPayrollController],
      providers: [{ provide: ZohoPayrollService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoPayrollController>(ZohoPayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
