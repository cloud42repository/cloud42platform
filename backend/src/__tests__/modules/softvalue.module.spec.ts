import 'reflect-metadata';
import { SoftvalueModule } from '../../softvalue/softvalue.module';
import { SoftvalueService } from '../../softvalue/softvalue.service';
import { SoftvalueController } from '../../softvalue/softvalue.controller';

describe('SoftvalueModule', () => {
  it('should be defined', () => {
    expect(SoftvalueModule).toBeDefined();
  });

  it('should register SoftvalueController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', SoftvalueModule);
    expect(controllers).toContain(SoftvalueController);
  });

  it('should register SoftvalueService in providers', () => {
    const providers = Reflect.getMetadata('providers', SoftvalueModule);
    expect(providers).toContain(SoftvalueService);
  });

  it('should export SoftvalueService', () => {
    const exports = Reflect.getMetadata('exports', SoftvalueModule);
    expect(exports).toContain(SoftvalueService);
  });
});
