import MockAdapter from "axios-mock-adapter";
import { ZohoAnalyticsClient } from "../../zoho-analytics/ZohoAnalyticsClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoAnalyticsClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("analytics-token"),
  });

describe("ZohoAnalyticsClient", () => {
  let client: ZohoAnalyticsClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("analyticsapi.zoho.com/api/v2");
  });

  it("injects auth header", async () => {
    mock.onGet("/workspaces").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/workspaces");
    expect(res.auth).toBe("Zoho-oauthtoken analytics-token");
  });

  // â”€â”€â”€ Workspaces â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listWorkspaces() calls GET /workspaces", async () => {
    mock.onGet("/workspaces").reply(200, { code: 0, data: { workspaces: [{ workspaceId: "WS-1", workspaceName: "Main" }] } });
    const res = await client.listWorkspaces();
    expect(res.data.workspaces[0].workspaceId).toBe("WS-1");
  });

  it("getWorkspace() calls GET /workspaces/:id", async () => {
    mock.onGet("/workspaces/WS-1").reply(200, { code: 0, data: { workspace: { workspaceId: "WS-1" } } });
    const res = await client.getWorkspace("WS-1");
    expect(res.data.workspace.workspaceId).toBe("WS-1");
  });

  it("createWorkspace() calls POST /workspaces", async () => {
    mock.onPost("/workspaces").reply(200, { code: 0, data: { workspace: { workspaceId: "WS-2" } } });
    const res = await client.createWorkspace({ workspaceName: "New WS" } as any);
    expect(res.data.workspace.workspaceId).toBe("WS-2");
  });

  it("deleteWorkspace() calls DELETE /workspaces/:id", async () => {
    mock.onDelete("/workspaces/WS-1").reply(200, { code: 0 });
    await expect(client.deleteWorkspace("WS-1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listViews() calls GET /workspaces/:wsId/views", async () => {
    mock.onGet("/workspaces/WS-1/views").reply(200, { code: 0, data: { views: [{ viewId: "V1" }] } });
    const res = await client.listViews("WS-1");
    expect(res.data.views[0].viewId).toBe("V1");
  });

  it("getView() calls GET /workspaces/:wsId/views/:viewId", async () => {
    mock.onGet("/workspaces/WS-1/views/V1").reply(200, { code: 0, data: { viewId: "V1" } });
    const res = await client.getView("WS-1", "V1");
    expect(res.data.viewId).toBe("V1");
  });

  it("createView() calls POST /workspaces/:wsId/views", async () => {
    mock.onPost("/workspaces/WS-1/views").reply(200, { code: 0, data: { viewId: "V2" } });
    const res = await client.createView("WS-1", { viewName: "Sales View", viewType: "TABLE" } as any);
    expect(res.data.viewId).toBe("V2");
  });

  it("deleteView() calls DELETE /workspaces/:wsId/views/:viewId", async () => {
    mock.onDelete("/workspaces/WS-1/views/V1").reply(200, { code: 0 });
    await expect(client.deleteView("WS-1", "V1")).resolves.toBeDefined();
  });

  // â”€â”€â”€ Data import / export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("importData() calls POST /workspaces/:wsId/tables/:table/data", async () => {
    mock.onPost("/workspaces/WS-1/tables/Sales/data").reply(200, { code: 0, importResult: {} });
    await expect(
      client.importData({ workspaceId: "WS-1", tableName: "Sales", importType: "APPEND" } as any, [])
    ).resolves.toBeDefined();
  });

  it("exportData() calls GET /workspaces/:wsId/views/:viewId/data", async () => {
    mock.onGet("/workspaces/WS-1/views/V1/data").reply(200, { code: 0, data: [] });
    await expect(client.exportData("WS-1", "V1")).resolves.toBeDefined();
  });
});
