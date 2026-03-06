import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ZohoPeopleService } from '../../zoho-people/zoho-people.service';

describe('ZohoPeopleService', () => {
  let service: ZohoPeopleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZohoPeopleService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test'), getOrThrow: jest.fn().mockReturnValue('test') },
        },
      ],
    }).compile();

    service = module.get<ZohoPeopleService>(ZohoPeopleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a client instance', () => {
    expect(service.client).toBeDefined();
  });
});
