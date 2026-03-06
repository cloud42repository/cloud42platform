import 'reflect-metadata';
import { ZohoExpenseModule } from '../../zoho-expense/zoho-expense.module';
import { ZohoExpenseService } from '../../zoho-expense/zoho-expense.service';
import { ZohoExpenseController } from '../../zoho-expense/zoho-expense.controller';

describe('ZohoExpenseModule', () => {
  it('should be defined', () => {
    expect(ZohoExpenseModule).toBeDefined();
  });

  it('should register ZohoExpenseController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoExpenseModule);
    expect(controllers).toContain(ZohoExpenseController);
  });

  it('should register ZohoExpenseService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoExpenseModule);
    expect(providers).toContain(ZohoExpenseService);
  });

  it('should export ZohoExpenseService', () => {
    const exports = Reflect.getMetadata('exports', ZohoExpenseModule);
    expect(exports).toContain(ZohoExpenseService);
  });
});
