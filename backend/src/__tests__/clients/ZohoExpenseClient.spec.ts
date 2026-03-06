import MockAdapter from "axios-mock-adapter";
import { ZohoExpenseClient } from "../../zoho-expense/ZohoExpenseClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ORG_ID = "org-exp-001";

const makeClient = (withOrg = true) =>
  new ZohoExpenseClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("expense-token"),
    ...(withOrg ? { organizationId: ORG_ID } : {}),
  });

describe("ZohoExpenseClient", () => {
  let client: ZohoExpenseClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("expense.zoho.com/api/v1");
  });

  it("appends organization_id when provided", async () => {
    mock.onGet("/expenses").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.get<{ params: Record<string, string> }>("/expenses");
    expect(res.params.organization_id).toBe(ORG_ID);
  });

  it("works without organizationId", async () => {
    const c = makeClient(false);
    const m = new MockAdapter(c.axiosInstance);
    m.onGet("/expenses").reply(200, { code: 0, expenses: [] });
    const res = await c.listExpenses();
    expect(Array.isArray(res.expenses)).toBe(true);
    m.restore();
  });

  // â”€â”€â”€ Categories â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listCategories() calls GET /expensecategories", async () => {
    mock.onGet("/expensecategories").reply(200, { code: 0, expense_categories: [{ category_id: "CAT-1" }] });
    const res = await client.listCategories();
    expect(res.expense_categories[0].category_id).toBe("CAT-1");
  });

  it("getCategory() calls GET /expensecategories/:id", async () => {
    mock.onGet("/expensecategories/CAT-1").reply(200, { code: 0, expense_category: { category_id: "CAT-1" } });
    const res = await client.getCategory("CAT-1");
    expect(res.expense_category.category_id).toBe("CAT-1");
  });

  // â”€â”€â”€ Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listExpenses() calls GET /expenses", async () => {
    mock.onGet("/expenses").reply(200, { code: 0, expenses: [{ expense_id: "EXP-1" }] });
    const res = await client.listExpenses();
    expect(res.expenses[0].expense_id).toBe("EXP-1");
  });

  it("getExpense() calls GET /expenses/:id", async () => {
    mock.onGet("/expenses/EXP-1").reply(200, { code: 0, expense: { expense_id: "EXP-1" } });
    const res = await client.getExpense("EXP-1");
    expect(res.expense.expense_id).toBe("EXP-1");
  });

  it("createExpense() calls POST /expenses", async () => {
    mock.onPost("/expenses").reply(200, { code: 0, expense: { expense_id: "EXP-2" } });
    const res = await client.createExpense({ account_id: "ACC-1", amount: 100 } as any);
    expect(res.expense.expense_id).toBe("EXP-2");
  });

  it("updateExpense() calls PUT /expenses/:id", async () => {
    mock.onPut("/expenses/EXP-1").reply(200, { code: 0, expense: { expense_id: "EXP-1" } });
    const res = await client.updateExpense("EXP-1", { amount: 200 } as any);
    expect(res.expense.expense_id).toBe("EXP-1");
  });

  it("deleteExpense() calls DELETE /expenses/:id", async () => {
    mock.onDelete("/expenses/EXP-1").reply(200, { code: 0, message: "deleted" });
    const res = await client.deleteExpense("EXP-1");
    expect(res.message).toBe("deleted");
  });

  // â”€â”€â”€ Expense Reports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listReports() calls GET /expensereports", async () => {
    mock.onGet("/expensereports").reply(200, { code: 0, expense_reports: [{ report_id: "RPT-1" }] });
    const res = await client.listReports();
    expect(res.expense_reports[0].report_id).toBe("RPT-1");
  });

  it("createReport() calls POST /expensereports", async () => {
    mock.onPost("/expensereports").reply(200, { code: 0, expense_report: { report_id: "RPT-2" } });
    const res = await client.createReport({ title: "Q1 Report" } as any);
    expect(res.expense_report.report_id).toBe("RPT-2");
  });

  it("submitReport() calls POST /expensereports/:id/submit", async () => {
    mock.onPost("/expensereports/RPT-1/submit").reply(200, { code: 0, message: "Submitted" });
    const res = await client.submitReport("RPT-1");
    expect(res.message).toBe("Submitted");
  });

  it("approveReport() calls POST /expensereports/:id/approve", async () => {
    mock.onPost("/expensereports/RPT-1/approve").reply(200, { code: 0, message: "Approved" });
    const res = await client.approveReport("RPT-1");
    expect(res.message).toBe("Approved");
  });

  it("deleteReport() calls DELETE /expensereports/:id", async () => {
    mock.onDelete("/expensereports/RPT-1").reply(200, { code: 0, message: "deleted" });
    await expect(client.deleteReport("RPT-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Advances â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listAdvances() calls GET /advancepayments", async () => {
    mock.onGet("/advancepayments").reply(200, { code: 0, advance_payments: [] });
    const res = await client.listAdvances();
    expect(Array.isArray(res.advance_payments)).toBe(true);
  });
});
