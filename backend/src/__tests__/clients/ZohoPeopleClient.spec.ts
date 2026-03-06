import MockAdapter from "axios-mock-adapter";
import { ZohoPeopleClient } from "../../zoho-people/ZohoPeopleClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoPeopleClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("people-token"),
  });

describe("ZohoPeopleClient", () => {
  let client: ZohoPeopleClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("people.zoho.com/people/api");
  });

  it("injects auth header", async () => {
    mock.onGet("/forms/employee/getRecords").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/forms/employee/getRecords");
    expect(res.auth).toBe("Zoho-oauthtoken people-token");
  });

  // â”€â”€â”€ Employees â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listEmployees() calls GET /forms/employee/getRecords", async () => {
    mock.onGet("/forms/employee/getRecords").reply(200, { code: 0, data: [{ empId: "E1" }] });
    const res = await client.listEmployees() as any;
    expect(res.data[0].empId).toBe("E1");
  });

  it("getEmployee() calls GET with recordId param", async () => {
    mock.onGet("/forms/employee/getDataByID").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.getEmployee("E1") as any;
    expect(res.params.recordId).toBe("E1");
  });

  it("addEmployee() calls POST /forms/employee/insertRecord", async () => {
    mock.onPost("/forms/employee/insertRecord").reply(200, { code: 0, result: { pkId: "E2" } });
    const res = await client.addEmployee({ First_Name: "John", Last_Name: "Doe" } as any) as any;
    expect(res.result.pkId).toBe("E2");
  });

  it("updateEmployee() calls POST /forms/employee/updateRecord", async () => {
    mock.onPost("/forms/employee/updateRecord").reply(200, { code: 0, result: {} });
    await expect(client.updateEmployee("E1", {} as any)).resolves.toBeDefined();
  });

  it("deleteEmployee() calls POST /forms/employee/deleteRecord", async () => {
    mock.onPost("/forms/employee/deleteRecord").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.deleteEmployee("E1") as any;
    expect(res.body.recordId).toBe("E1");
  });

  // â”€â”€â”€ Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listDepartments() calls GET departments endpoint", async () => {
    mock.onGet("/topbar/v1/data").reply(200, { code: 0, departments: [] });
    await expect(client.listDepartments()).resolves.toBeDefined();
  });

  // â”€â”€â”€ Leave â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listLeaveTypes() calls GET /leave/v2/leavetypes", async () => {
    mock.onGet("/leave/v2/leavetypes").reply(200, { code: 0, result: [] });
    await expect(client.listLeaveTypes()).resolves.toBeDefined();
  });

  it("listLeaveRequests() calls GET /leave/v2/leaveList", async () => {
    mock.onGet("/leave/v2/leaveList").reply(200, { code: 0, result: [] });
    await expect(client.listLeaveRequests()).resolves.toBeDefined();
  });

  it("addLeaveRequest() calls POST /leave/v2/addLeave", async () => {
    mock.onPost("/leave/v2/addLeave").reply(200, { code: 0, result: {} });
    await expect(client.addLeaveRequest({ from: "2024-01-01" } as any)).resolves.toBeDefined();
  });

  it("approveLeave() calls POST /leave/v2/updateStatus with Approved", async () => {
    mock.onPost("/leave/v2/updateStatus").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.approveLeave("LV1") as any;
    expect(res.body.status).toBe("Approved");
    expect(res.body.leaveId).toBe("LV1");
  });

  it("rejectLeave() calls POST /leave/v2/updateStatus with Rejected", async () => {
    mock.onPost("/leave/v2/updateStatus").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.rejectLeave("LV1", "Not eligible") as any;
    expect(res.body.status).toBe("Rejected");
    expect(res.body.comments).toBe("Not eligible");
  });

  // â”€â”€â”€ Attendance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listAttendance() calls GET with empId param", async () => {
    mock.onGet("/attendance/v1/attendanceList").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.listAttendance("E1") as any;
    expect(res.params.empId).toBe("E1");
  });

  // â”€â”€â”€ Custom Forms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("getFormRecords() calls GET /forms/:name/getRecords", async () => {
    mock.onGet("/forms/training/getRecords").reply(200, { code: 0, data: [] });
    await expect(client.getFormRecords("training")).resolves.toBeDefined();
  });
});
