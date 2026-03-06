import 'reflect-metadata';
import { ZohoInventoryModule } from '../../zoho-inventory/zoho-inventory.module';
import { ZohoInventoryService } from '../../zoho-inventory/zoho-inventory.service';
import { ZohoInventoryController } from '../../zoho-inventory/zoho-inventory.controller';

describe('ZohoInventoryModule', () => {
  it('should be defined', () => {
    expect(ZohoInventoryModule).toBeDefined();
  });

  it('should register ZohoInventoryController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoInventoryModule);
    expect(controllers).toContain(ZohoInventoryController);
  });

  it('should register ZohoInventoryService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoInventoryModule);
    expect(providers).toContain(ZohoInventoryService);
  });

  it('should export ZohoInventoryService', () => {
    const exports = Reflect.getMetadata('exports', ZohoInventoryModule);
    expect(exports).toContain(ZohoInventoryService);
  });
});
