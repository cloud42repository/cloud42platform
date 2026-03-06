import { Test, TestingModule } from '@nestjs/testing';
import { ZohoBooksController } from '../../zoho-books/zoho-books.controller';
import { ZohoBooksService } from '../../zoho-books/zoho-books.service';

const mockService: Partial<ZohoBooksService> = {};

describe('ZohoBooksController', () => {
  let controller: ZohoBooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZohoBooksController],
      providers: [{ provide: ZohoBooksService, useValue: mockService }],
    }).compile();

    controller = module.get<ZohoBooksController>(ZohoBooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
