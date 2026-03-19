import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoExpenseController } from '../../zoho-expense/zoho-expense.controller';

describe('ZohoExpenseController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoExpenseController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoExpenseController>(ZohoExpenseController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Categories ---
  it('GET /zoho-expense/categories → listCategories()', async () => {
    const result = await controller.listCategories();
    expect(result).toBeDefined();
  });

  it('GET /zoho-expense/categories/:id → getCategory()', async () => {
    const result = await controller.getCategory('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Expenses ---
  it('GET /zoho-expense/expenses → listExpenses()', async () => {
    const result = await controller.listExpenses({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-expense/expenses/:id → getExpense()', async () => {
    const result = await controller.getExpense('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-expense/expenses → createExpense()', async () => {
    const result = await controller.createExpense({ category_id: '1', amount: 50, date: '2026-01-01' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-expense/expenses/:id → updateExpense()', async () => {
    const result = await controller.updateExpense('000000000000001', { amount: 75 });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-expense/expenses/:id → deleteExpense()', async () => {
    const result = await controller.deleteExpense('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Reports ---
  it('GET /zoho-expense/reports → listReports()', async () => {
    const result = await controller.listReports({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-expense/reports/:id → getReport()', async () => {
    const result = await controller.getReport('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-expense/reports → createReport()', async () => {
    const result = await controller.createReport({ report_name: 'Q1 Expenses' });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-expense/reports/:id → updateReport()', async () => {
    const result = await controller.updateReport('000000000000001', { report_name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-expense/reports/:id → deleteReport()', async () => {
    const result = await controller.deleteReport('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-expense/reports/:id/submit → submitReport()', async () => {
    const result = await controller.submitReport('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-expense/reports/:id/approve → approveReport()', async () => {
    const result = await controller.approveReport('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Advances ---
  it('GET /zoho-expense/advances → listAdvances()', async () => {
    const result = await controller.listAdvances();
    expect(result).toBeDefined();
  });

  it('GET /zoho-expense/advances/:id → getAdvance()', async () => {
    const result = await controller.getAdvance('000000000000001');
    expect(result).toBeDefined();
  });
});
