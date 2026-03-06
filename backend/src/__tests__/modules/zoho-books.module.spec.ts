import 'reflect-metadata';
import { ZohoBooksModule } from '../../zoho-books/zoho-books.module';
import { ZohoBooksService } from '../../zoho-books/zoho-books.service';
import { ZohoBooksController } from '../../zoho-books/zoho-books.controller';

describe('ZohoBooksModule', () => {
  it('should be defined', () => {
    expect(ZohoBooksModule).toBeDefined();
  });

  it('should register ZohoBooksController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoBooksModule);
    expect(controllers).toContain(ZohoBooksController);
  });

  it('should register ZohoBooksService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoBooksModule);
    expect(providers).toContain(ZohoBooksService);
  });

  it('should export ZohoBooksService', () => {
    const exports = Reflect.getMetadata('exports', ZohoBooksModule);
    expect(exports).toContain(ZohoBooksService);
  });
});
