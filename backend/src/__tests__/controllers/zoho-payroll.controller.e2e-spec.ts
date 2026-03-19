import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoPayrollController } from '../../zoho-payroll/zoho-payroll.controller';

describe('ZohoPayrollController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoPayrollController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoPayrollController>(ZohoPayrollController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Employees ---
  it('GET /zoho-payroll/employees → listEmployees()', async () => {
    const result = await controller.listEmployees({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-payroll/employees/:id → getEmployee()', async () => {
    const result = await controller.getEmployee('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-payroll/employees → createEmployee()', async () => {
    const result = await controller.createEmployee({ first_name: 'Test', last_name: 'User', email: 'test@test.com' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-payroll/employees/:id → updateEmployee()', async () => {
    const result = await controller.updateEmployee('000000000000001', { first_name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-payroll/employees/:id/terminate → terminateEmployee()', async () => {
    const result = await controller.terminateEmployee('000000000000001', { terminationDate: '2026-12-31', reason: 'Test' });
    expect(result).toBeDefined();
  });

  // --- Pay Components ---
  it('GET /zoho-payroll/pay-components → listPayComponents()', async () => {
    const result = await controller.listPayComponents();
    expect(result).toBeDefined();
  });

  it('GET /zoho-payroll/pay-components/:id → getPayComponent()', async () => {
    const result = await controller.getPayComponent('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Pay Runs ---
  it('GET /zoho-payroll/payruns → listPayRuns()', async () => {
    const result = await controller.listPayRuns({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-payroll/payruns/:id → getPayRun()', async () => {
    const result = await controller.getPayRun('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-payroll/payruns → createPayRun()', async () => {
    const result = await controller.createPayRun({ pay_period: '2026-01' });
    expect(result).toBeDefined();
  });

  it('POST /zoho-payroll/payruns/:id/approve → approvePayRun()', async () => {
    const result = await controller.approvePayRun('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Payslips ---
  it('GET /zoho-payroll/payruns/:payRunId/payslips → listPayslips()', async () => {
    const result = await controller.listPayslips('000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-payroll/payruns/:payRunId/payslips/:payslipId → getPayslip()', async () => {
    const result = await controller.getPayslip('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });

  // --- Declarations ---
  it('GET /zoho-payroll/declarations → listDeclarations()', async () => {
    const result = await controller.listDeclarations({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-payroll/declarations/:id → getDeclaration()', async () => {
    const result = await controller.getDeclaration('000000000000001');
    expect(result).toBeDefined();
  });
});
