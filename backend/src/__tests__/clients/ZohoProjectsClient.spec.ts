import MockAdapter from "axios-mock-adapter";
import { ZohoProjectsClient } from "../../zoho-projects/ZohoProjectsClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";

const PORTAL_ID = "portal-001";

const makeClient = (portalId?: string) =>
  new ZohoProjectsClient({
    clientId: "cid",
    clientSecret: "csecret",
    authProvider: new PassthroughAuth("projects-token"),
    portalId,
  });

describe("ZohoProjectsClient", () => {
  let client: ZohoProjectsClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient(PORTAL_ID);
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  it("uses the correct base URL", () => {
    expect(client.axiosInstance.defaults.baseURL ?? "").toContain("projectsapi.zoho.com/restapi");
  });

  it("injects auth header", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/`).reply((cfg) => [200, { code: 0, auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>(`/portal/${PORTAL_ID}/projects/`);
    expect(res.auth).toBe("Zoho-oauthtoken projects-token");
  });

  it("uses portal prefix when portalId is set", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/`).reply(200, { code: 0, projects: [] });
    const res = await client.listProjects();
    expect(Array.isArray(res.projects)).toBe(true);
  });

  it("omits portal prefix when portalId is not set", async () => {
    const c = makeClient();
    const m = new MockAdapter(c.axiosInstance);
    m.onGet("/projects/").reply(200, { code: 0, projects: [] });
    const res = await c.listProjects();
    expect(Array.isArray(res.projects)).toBe(true);
    m.restore();
  });

  // â”€â”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listProjects() calls GET /portal/:id/projects/", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/`).reply(200, { code: 0, projects: [{ id: "P1" }] });
    const res = await client.listProjects();
    expect(res.projects[0].id).toBe("P1");
  });

  it("getProject() calls GET /portal/:id/projects/:projectId/", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/P1/`).reply(200, { code: 0, projects: [{ id: "P1" }] });
    const res = await client.getProject("P1");
    expect(res.projects[0].id).toBe("P1");
  });

  it("createProject() calls POST /portal/:id/projects/", async () => {
    mock.onPost(`/portal/${PORTAL_ID}/projects/`).reply(200, { code: 0, projects: [{ id: "P2" }] });
    const res = await client.createProject({ name: "New Project" } as any);
    expect(res.projects[0].id).toBe("P2");
  });

  it("deleteProject() calls DELETE /portal/:id/projects/:projectId/", async () => {
    mock.onDelete(`/portal/${PORTAL_ID}/projects/P1/`).reply(200, { code: 0, response: "Project deleted." });
    const res = await client.deleteProject("P1");
    expect(res.response).toBeDefined();
  });

  // â”€â”€â”€ Tasks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTasks() calls GET /portal/:id/projects/:projectId/tasks/", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/P1/tasks/`).reply(200, { code: 0, tasks: [{ id: "T1" }] });
    const res = await client.listTasks("P1");
    expect(res.tasks[0].id).toBe("T1");
  });

  it("createTask() calls POST /portal/:id/projects/:projectId/tasks/", async () => {
    mock.onPost(`/portal/${PORTAL_ID}/projects/P1/tasks/`).reply(200, { code: 0, tasks: [{ id: "T2" }] });
    const res = await client.createTask("P1", { name: "Task 1" } as any);
    expect(res.tasks[0].id).toBe("T2");
  });

  it("deleteTask() calls DELETE /portal/:id/projects/:projectId/tasks/:taskId/", async () => {
    mock.onDelete(`/portal/${PORTAL_ID}/projects/P1/tasks/T1/`).reply(200, { code: 0, response: "Task deleted." });
    const res = await client.deleteTask("P1", "T1");
    expect(res.response).toBeDefined();
  });

  // â”€â”€â”€ Bugs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listBugs() calls GET /portal/:id/projects/:projectId/bugs/", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/P1/bugs/`).reply(200, { code: 0, bugs: [] });
    const res = await client.listBugs("P1");
    expect(Array.isArray(res.bugs)).toBe(true);
  });

  it("createBug() calls POST /portal/:id/projects/:projectId/bugs/", async () => {
    mock.onPost(`/portal/${PORTAL_ID}/projects/P1/bugs/`).reply(200, { code: 0, bugs: [{ id: "B1" }] });
    const res = await client.createBug("P1", { title: "Bug report" } as any);
    expect(res.bugs[0].id).toBe("B1");
  });

  // â”€â”€â”€ Milestones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listMilestones() calls GET /portal/:id/projects/:projectId/milestones/", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/P1/milestones/`).reply(200, { code: 0, milestones: [] });
    const res = await client.listMilestones("P1");
    expect(Array.isArray(res.milestones)).toBe(true);
  });

  // â”€â”€â”€ Time Logs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listTimeLogs() calls GET /portal/:id/projects/:projectId/logs/", async () => {
    mock.onGet(`/portal/${PORTAL_ID}/projects/P1/logs/`).reply(200, { code: 0, timelogs: {} });
    await expect(client.listTimeLogs("P1")).resolves.toBeDefined();
  });
});
