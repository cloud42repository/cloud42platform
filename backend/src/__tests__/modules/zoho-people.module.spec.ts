import 'reflect-metadata';
import { ZohoPeopleModule } from '../../zoho-people/zoho-people.module';
import { ZohoPeopleService } from '../../zoho-people/zoho-people.service';
import { ZohoPeopleController } from '../../zoho-people/zoho-people.controller';

describe('ZohoPeopleModule', () => {
  it('should be defined', () => {
    expect(ZohoPeopleModule).toBeDefined();
  });

  it('should register ZohoPeopleController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoPeopleModule);
    expect(controllers).toContain(ZohoPeopleController);
  });

  it('should register ZohoPeopleService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoPeopleModule);
    expect(providers).toContain(ZohoPeopleService);
  });

  it('should export ZohoPeopleService', () => {
    const exports = Reflect.getMetadata('exports', ZohoPeopleModule);
    expect(exports).toContain(ZohoPeopleService);
  });
});
