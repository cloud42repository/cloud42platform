import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../../auth-config/auth-config.service';
import { ZohoRecruitService } from '../../zoho-recruit/zoho-recruit.service';

describe('ZohoRecruitService', () => {
  let service: ZohoRecruitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoRecruitService,
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

    service = module.get<ZohoRecruitService>(ZohoRecruitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service['defaultClient']).toBeDefined();
  });
});
