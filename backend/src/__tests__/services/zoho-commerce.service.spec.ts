import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../../auth-config/auth-config.service';
import { ZohoCommerceService } from '../../zoho-commerce/zoho-commerce.service';

describe('ZohoCommerceService', () => {
  let service: ZohoCommerceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoCommerceService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test'), getOrThrow: jest.fn().mockReturnValue('test') },
        },
        {
          provide: AuthConfigService,
          useValue: { findOne: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<ZohoCommerceService>(ZohoCommerceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service['defaultClient']).toBeDefined();
  });
});
