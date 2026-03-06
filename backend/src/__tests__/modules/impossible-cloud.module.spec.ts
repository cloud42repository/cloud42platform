import 'reflect-metadata';
import { ImpossibleCloudModule } from '../../impossible-cloud/impossible-cloud.module';
import { ImpossibleCloudService } from '../../impossible-cloud/impossible-cloud.service';
import { ImpossibleCloudController } from '../../impossible-cloud/impossible-cloud.controller';

describe('ImpossibleCloudModule', () => {
  it('should be defined', () => {
    expect(ImpossibleCloudModule).toBeDefined();
  });

  it('should register ImpossibleCloudController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ImpossibleCloudModule);
    expect(controllers).toContain(ImpossibleCloudController);
  });

  it('should register ImpossibleCloudService in providers', () => {
    const providers = Reflect.getMetadata('providers', ImpossibleCloudModule);
    expect(providers).toContain(ImpossibleCloudService);
  });

  it('should export ImpossibleCloudService', () => {
    const exports = Reflect.getMetadata('exports', ImpossibleCloudModule);
    expect(exports).toContain(ImpossibleCloudService);
  });
});
