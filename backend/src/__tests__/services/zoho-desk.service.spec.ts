import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ZohoDeskService } from '../../zoho-desk/zoho-desk.service';

describe('ZohoDeskService', () => {
  let service: ZohoDeskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoDeskService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test'), getOrThrow: jest.fn().mockReturnValue('test') },
        },
      ],
    }).compile();

    service = module.get<ZohoDeskService>(ZohoDeskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service.client).toBeDefined();
  });
});
