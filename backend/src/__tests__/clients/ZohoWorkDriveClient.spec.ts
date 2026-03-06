import MockAdapter from "axios-mock-adapter";
import { ZohoWorkDriveClient } from "../../zoho-workdrive/ZohoWorkDriveClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const makeClient = () =>
  new ZohoWorkDriveClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("workdrive-token"),
  });

describe("ZohoWorkDriveClient", () => {
  let client: ZohoWorkDriveClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("workdrive.zoho.com/api/v1");
  });

  it("injects auth header", async () => {
    mock.onGet("/teams").reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/teams");
    expect(res.auth).toBe("Zoho-oauthtoken workdrive-token");
  });

  // â”€â”€â”€ Teams â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTeams() calls GET /teams", async () => {
    mock.onGet("/teams").reply(200, { code: 0, data: [{ id: "TM-1" }] });
    const res = await client.listTeams();
    expect(res.data[0].id).toBe("TM-1");
  });

  it("getTeam() calls GET /teams/:id", async () => {
    mock.onGet("/teams/TM-1").reply(200, { code: 0, data: { id: "TM-1" } });
    const res = await client.getTeam("TM-1");
    expect(res.data.id).toBe("TM-1");
  });

  // â”€â”€â”€ Folders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("getFolder() calls GET /files/:id", async () => {
    mock.onGet("/files/F1").reply(200, { code: 0, data: { id: "F1" } });
    const res = await client.getFolder("F1");
    expect(res.data.id).toBe("F1");
  });

  it("createFolder() calls POST /files with folder payload", async () => {
    mock.onPost("/files").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.createFolder({ name: "Reports", parent_id: "F0" }) as any;
    expect(res.body.data.attributes.name).toBe("Reports");
    expect(res.body.data.type).toBe("files");
  });

  it("deleteFolder() calls DELETE /files/:id", async () => {
    mock.onDelete("/files/F1").reply(200, { code: 0 });
    await expect(client.deleteFolder("F1")).resolves.toBeDefined();
  });

  it("listFolderContents() calls GET /files/:id/files", async () => {
    mock.onGet("/files/F1/files").reply(200, { code: 0, data: [] });
    const res = await client.listFolderContents("F1");
    expect(Array.isArray(res.data)).toBe(true);
  });

  // â”€â”€â”€ Files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("getFile() calls GET /files/:id", async () => {
    mock.onGet("/files/FILE-1").reply(200, { code: 0, data: { id: "FILE-1" } });
    const res = await client.getFile("FILE-1");
    expect(res.data.id).toBe("FILE-1");
  });

  it("deleteFile() calls DELETE /files/:id", async () => {
    mock.onDelete("/files/FILE-1").reply(200, { code: 0 });
    await expect(client.deleteFile("FILE-1")).resolves.toBeDefined();
  });

  it("searchFiles() calls GET /teams/:teamId/files/search with query param", async () => {
    mock.onGet("/teams/TM-1/files/search").reply((cfg) => [200, { code: 0, params: cfg.params }]);
    const res = await client.searchFiles("TM-1", "report") as any;
    expect(res.params.search_query).toBe("report");
  });

  it("copyFile() calls POST /files/:id/copy with target folder", async () => {
    mock.onPost("/files/FILE-1/copy").reply((cfg) => [200, { code: 0, body: JSON.parse(cfg.data) }]);
    const res = await client.copyFile("FILE-1", "F2") as any;
    expect(res.body.data.attributes.parent_id).toBe("F2");
  });

  // â”€â”€â”€ Share Links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("getShareLink() calls GET /files/:id/sharelinks", async () => {
    mock.onGet("/files/FILE-1/sharelinks").reply(200, { code: 0, data: { link: "https://workdrive.zoho.com/share/SL-1" } });
    const res = await client.getShareLink("FILE-1");
    expect(res.data.link).toBe("https://workdrive.zoho.com/share/SL-1");
  });

  it("createShareLink() calls POST /files/:entityId/sharelinks", async () => {
    mock.onPost("/files/FILE-1/sharelinks").reply(200, { code: 0, data: { link: "https://workdrive.zoho.com/share/SL-2" } });
    const res = await client.createShareLink({ entity_id: "FILE-1", type: "open" } as any);
    expect(res.data.link).toBe("https://workdrive.zoho.com/share/SL-2");
  });

  // â”€â”€â”€ Members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listWorkspaceMembers() calls GET /workspaces/:id/members", async () => {
    mock.onGet("/workspaces/WS-1/members").reply(200, { code: 0, data: [] });
    const res = await client.listWorkspaceMembers("WS-1");
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("addWorkspaceMember() calls POST /workspaces/:id/members", async () => {
    mock.onPost("/workspaces/WS-1/members").reply(200, { code: 0, data: {} });
    await expect(client.addWorkspaceMember("WS-1", "user@test.com", "admin")).resolves.toBeDefined();
  });

  it("removeWorkspaceMember() calls DELETE /workspaces/:id/members/:memberId", async () => {
    mock.onDelete("/workspaces/WS-1/members/MB-1").reply(200, { code: 0 });
    await expect(client.removeWorkspaceMember("WS-1", "MB-1")).resolves.toBeDefined();
  });
});
