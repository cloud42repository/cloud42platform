import MockAdapter from "axios-mock-adapter";
import { ZohoPayrollClient } from "../../zoho-payroll/ZohoPayrollClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const ORG_ID = "org-pay-001";

const makeClient = () =>
  new ZohoPayrollClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("payroll-token"),
    organizationId: ORG_ID,
  });

describe("ZohoPayrollClient", () => {
  let client: ZohoPayrollClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("payroll.zoho.com/api/v1");
  });

  it("appends organization_id when provided", async () => {
    mock.onGet("/employees").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.get<{ params: Record<string, string> }>("/employees");
    expect(res.params.organization_id).toBe(ORG_ID);
  });

  // â”€â”€â”€ Employees â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listEmployees() calls GET /employees", async () => {
    mock.onGet("/employees").reply(200, { code: 0, employees: [{ employee_id: "EMP-1" }] });
    const res = await client.listEmployees();
    expect(res.employees[0].employee_id).toBe("EMP-1");
  });

  it("getEmployee() calls GET /employees/:id", async () => {
    mock.onGet("/employees/EMP-1").reply(200, { code: 0, employee: { employee_id: "EMP-1" } });
    const res = await client.getEmployee("EMP-1");
    expect(res.employee.employee_id).toBe("EMP-1");
  });

  it("createEmployee() calls POST /employees", async () => {
    mock.onPost("/employees").reply(200, { code: 0, employee: { employee_id: "EMP-2" } });
    const res = await client.createEmployee({ first_name: "John", last_name: "Doe" } as any);
    expect(res.employee.employee_id).toBe("EMP-2");
  });

  it("updateEmployee() calls PUT /employees/:id", async () => {
    mock.onPut("/employees/EMP-1").reply(200, { code: 0, employee: { employee_id: "EMP-1" } });
    const res = await client.updateEmployee("EMP-1", { department: "IT" } as any);
    expect(res.employee.employee_id).toBe("EMP-1");
  });

  it("terminateEmployee() calls POST /employees/:id/terminate", async () => {
    mock.onPost("/employees/EMP-1/terminate").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.terminateEmployee("EMP-1", "2024-12-31") as any;
    expect(res.body.termination_date).toBe("2024-12-31");
  });

  // â”€â”€â”€ Pay Components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPayComponents() calls GET /paycomponents", async () => {
    mock.onGet("/paycomponents").reply(200, { code: 0, pay_components: [] });
    const res = await client.listPayComponents();
    expect(Array.isArray(res.pay_components)).toBe(true);
  });

  it("getPayComponent() calls GET /paycomponents/:id", async () => {
    mock.onGet("/paycomponents/PC-1").reply(200, { code: 0, pay_component: { component_id: "PC-1" } });
    const res = await client.getPayComponent("PC-1");
    expect(res.pay_component.component_id).toBe("PC-1");
  });

  // â”€â”€â”€ Pay Runs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPayRuns() calls GET /payruns", async () => {
    mock.onGet("/payruns").reply(200, { code: 0, pay_runs: [{ pay_run_id: "PR-1" }] });
    const res = await client.listPayRuns();
    expect(res.pay_runs[0].pay_run_id).toBe("PR-1");
  });

  it("createPayRun() calls POST /payruns", async () => {
    mock.onPost("/payruns").reply(200, { code: 0, pay_run: { pay_run_id: "PR-2" } });
    const res = await client.createPayRun({ pay_period: "2024-01" } as any);
    expect(res.pay_run.pay_run_id).toBe("PR-2");
  });

  it("approvePayRun() calls POST /payruns/:id/approve", async () => {
    mock.onPost("/payruns/PR-1/approve").reply(200, { code: 0, pay_run: { pay_run_id: "PR-1", status: "approved" } });
    const res = await client.approvePayRun("PR-1");
    expect(res.pay_run.status).toBe("approved");
  });

  // â”€â”€â”€ Payslips â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPayslips() calls GET /payruns/:id/payslips", async () => {
    mock.onGet("/payruns/PR-1/payslips").reply(200, { code: 0, payslips: [] });
    const res = await client.listPayslips("PR-1");
    expect(Array.isArray(res.payslips)).toBe(true);
  });

  it("getPayslip() calls GET /payruns/:id/payslips/:slipId", async () => {
    mock.onGet("/payruns/PR-1/payslips/PS-1").reply(200, { code: 0, payslip: { payslip_id: "PS-1" } });
    const res = await client.getPayslip("PR-1", "PS-1");
    expect(res.payslip.payslip_id).toBe("PS-1");
  });

  // â”€â”€â”€ Tax Declarations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listDeclarations() calls GET /declarations", async () => {
    mock.onGet("/declarations").reply(200, { code: 0, declarations: [] });
    const res = await client.listDeclarations();
    expect(Array.isArray(res.declarations)).toBe(true);
  });
});
