import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ZohoPayrollService } from '../../zoho-payroll/zoho-payroll.service';

describe('ZohoPayrollService', () => {
  let service: ZohoPayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoPayrollService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test'), getOrThrow: jest.fn().mockReturnValue('test') },
        },
      ],
    }).compile();

    service = module.get<ZohoPayrollService>(ZohoPayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service.client).toBeDefined();
  });
});
