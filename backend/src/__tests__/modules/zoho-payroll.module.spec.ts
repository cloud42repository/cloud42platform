import 'reflect-metadata';
import { ZohoPayrollModule } from '../../zoho-payroll/zoho-payroll.module';
import { ZohoPayrollService } from '../../zoho-payroll/zoho-payroll.service';
import { ZohoPayrollController } from '../../zoho-payroll/zoho-payroll.controller';

describe('ZohoPayrollModule', () => {
  it('should be defined', () => {
    expect(ZohoPayrollModule).toBeDefined();
  });

  it('should register ZohoPayrollController in controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ZohoPayrollModule);
    expect(controllers).toContain(ZohoPayrollController);
  });

  it('should register ZohoPayrollService in providers', () => {
    const providers = Reflect.getMetadata('providers', ZohoPayrollModule);
    expect(providers).toContain(ZohoPayrollService);
  });

  it('should export ZohoPayrollService', () => {
    const exports = Reflect.getMetadata('exports', ZohoPayrollModule);
    expect(exports).toContain(ZohoPayrollService);
  });
});
