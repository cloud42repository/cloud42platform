import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SoftvalueService } from '../../softvalue/softvalue.service';

describe('SoftvalueService', () => {
  let service: SoftvalueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftvalueService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test'), getOrThrow: jest.fn().mockReturnValue('test') },
        },
      ],
    }).compile();

    service = module.get<SoftvalueService>(SoftvalueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service.client).toBeDefined();
  });
});
