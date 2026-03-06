import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ZohoSalesIQService } from '../../zoho-salesiq/zoho-salesiq.service';

describe('ZohoSalesIQService', () => {
  let service: ZohoSalesIQService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoSalesIQService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test'), getOrThrow: jest.fn().mockReturnValue('test') },
        },
      ],
    }).compile();

    service = module.get<ZohoSalesIQService>(ZohoSalesIQService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service.client).toBeDefined();
  });
});
