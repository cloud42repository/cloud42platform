import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../../auth-config/auth-config.service';
import { ZohoSubscriptionsService } from '../../zoho-subscriptions/zoho-subscriptions.service';

describe('ZohoSubscriptionsService', () => {
  let service: ZohoSubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoSubscriptionsService,
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

    service = module.get<ZohoSubscriptionsService>(ZohoSubscriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service['defaultClient']).toBeDefined();
  });
});
