import 'reflect-metadata';
import { ZohoDeskModule } from '../../zoho-desk/zoho-desk.module';
import { ZohoDeskService } from '../../zoho-desk/zoho-desk.service';
import { ZohoDeskController } from '../../zoho-desk/zoho-desk.controller';

describe('ZohoDeskModule', () => {
  it('should be defined', () => {
    expect(ZohoDeskModule).toBeDefined();
  });

  it('should register ZohoDeskController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoDeskModule);
    expect(controllers).toContain(ZohoDeskController);
  });

  it('should register ZohoDeskService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoDeskModule);
    expect(providers).toContain(ZohoDeskService);
  });

  it('should export ZohoDeskService', () => {
    const exports = Reflect.getMetadata('exports', ZohoDeskModule);
    expect(exports).toContain(ZohoDeskService);
  });
});
