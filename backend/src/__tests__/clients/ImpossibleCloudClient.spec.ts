import MockAdapter from "axios-mock-adapter";
import {
  ImpossibleCloudClient,
  ImpossibleCloudApiError,
} from "../../impossible-cloud/ImpossibleCloudClient";

const API_KEY = "test-ic-api-key";

const makeClient = (overrides?: { baseUrl?: string }) =>
  new ImpossibleCloudClient({ apiKey: API_KEY, ...overrides });

describe("ImpossibleCloudClient", () => {
  let client: ImpossibleCloudClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  // â”€â”€â”€ Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("uses the default base URL", () => {
    expect(client.axiosInstance.defaults.baseURL).toBe(
      "https://api.partner.impossiblecloud.com/v1"
    );
  });

  it("uses a custom base URL when provided", () => {
    const c = makeClient({ baseUrl: "https://custom.host/v1" });
    expect(c.axiosInstance.defaults.baseURL).toBe("https://custom.host/v1");
  });

  // â”€â”€â”€ Authentication â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("injects Bearer token in Authorization header", async () => {
    mock
      .onGet("/contract/list")
      .reply((cfg) => [200, { auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/contract/list");
    expect(res.auth).toBe(`Bearer ${API_KEY}`);
  });

  it("updateApiKey() changes the token used in subsequent requests", async () => {
    client.updateApiKey("new-key-abc");
    mock
      .onGet("/contract/list")
      .reply((cfg) => [200, { auth: cfg.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/contract/list");
    expect(res.auth).toBe("Bearer new-key-abc");
  });

  // â”€â”€â”€ Error handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("wraps HTTP errors in ImpossibleCloudApiError", async () => {
    mock.onGet("/contract/list").reply(401, { message: "Unauthorized" });
    await expect(client.listContracts()).rejects.toBeInstanceOf(ImpossibleCloudApiError);
  });

  it("ImpossibleCloudApiError carries the HTTP status code", async () => {
    mock.onGet("/contract/list").reply(403, { message: "Forbidden" });
    let err!: ImpossibleCloudApiError;
    try {
      await client.listContracts();
    } catch (e) {
      err = e as ImpossibleCloudApiError;
    }
    expect(err.status).toBe(403);
  });

  // â”€â”€â”€ Integrations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listRegions() calls GET /integration/regions/list", async () => {
    mock.onGet("/integration/regions/list").reply(200, {
      regions: [{ name: "eu-south-1", s3_url: "https://s3.eu-south-1.impossiblecloud.com" }],
    });
    const res = await client.listRegions();
    expect(res.regions![0].name).toBe("eu-south-1");
  });

  // â”€â”€â”€ Distributors â€“ Contracts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listContracts() calls GET /contract/list", async () => {
    mock.onGet("/contract/list").reply(200, [{ id: "CNT-1", currency: "EUR" }]);
    const res = await client.listContracts();
    expect(res[0].id).toBe("CNT-1");
    expect(res[0].currency).toBe("EUR");
  });

  it("listContractPartners() calls GET /contract/{id}/partners", async () => {
    mock
      .onGet("/contract/CNT-1/partners")
      .reply(200, [{ id: "P-1", name: "Acme Partners" }]);
    const res = await client.listContractPartners("CNT-1");
    expect(res[0].id).toBe("P-1");
    expect(res[0].name).toBe("Acme Partners");
  });

  // â”€â”€â”€ Distributors â€“ Partners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("createPartner() calls POST /partner with partner payload", async () => {
    mock.onPost("/partner").reply((cfg) => [
      201,
      { id: "P-2", ...JSON.parse(cfg.data) },
    ]);
    const res = await client.createPartner({
      distributorContractId: "CNT-1",
      name: "New Partner",
      allocatedCapacity: 500,
    });
    expect(res.id).toBe("P-2");
    expect(res.name).toBe("New Partner");
    expect(res.allocatedCapacity).toBe(500);
  });

  it("getPartner() calls GET /partner/{id}", async () => {
    mock.onGet("/partner/P-1").reply(200, { id: "P-1", name: "Acme" });
    const res = await client.getPartner("P-1");
    expect(res.id).toBe("P-1");
  });

  it("updatePartner() calls PUT /partner/{id} with update payload", async () => {
    mock.onPut("/partner/P-1").reply((cfg) => [
      200,
      { id: "P-1", ...JSON.parse(cfg.data) },
    ]);
    const res = await client.updatePartner("P-1", { name: "Renamed", allocatedCapacity: 1000 });
    expect(res.name).toBe("Renamed");
    expect(res.allocatedCapacity).toBe(1000);
  });

  it("deletePartner() calls DELETE /partner/{id}", async () => {
    mock.onDelete("/partner/P-1").reply(204);
    await expect(client.deletePartner("P-1")).resolves.toBeUndefined();
  });

  // â”€â”€â”€ Distributors â€“ Members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("createMember() calls POST /partner/{id}/member", async () => {
    mock.onPost("/partner/P-1/member").reply(201, {
      id: "M-1",
      email: "user@test.com",
      role: "admin",
    });
    const res = await client.createMember("P-1", {
      email: "user@test.com",
      password: "S3cur3!Pass",
      role: "admin",
    });
    expect(res.id).toBe("M-1");
    expect(res.email).toBe("user@test.com");
    expect(res.role).toBe("admin");
  });

  it("deleteMember() calls DELETE /partner/{id}/member/{memberId}", async () => {
    mock.onDelete("/partner/P-1/member/M-1").reply(204);
    await expect(client.deleteMember("P-1", "M-1")).resolves.toBeUndefined();
  });

  it("listMembers() calls GET /partner/{id}/members", async () => {
    mock.onGet("/partner/P-1/members").reply(200, [
      { id: "M-1", email: "a@test.com", role: "staff" },
      { id: "M-2", email: "b@test.com", role: "viewer" },
    ]);
    const res = await client.listMembers("P-1");
    expect(res).toHaveLength(2);
    expect(res[0].role).toBe("staff");
  });

  // â”€â”€â”€ Distributors â€“ Storage Accounts (partner-scoped) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("listPartnerStorageAccounts() calls GET /partner/{id}/storage-accounts", async () => {
    mock.onGet("/partner/P-1/storage-accounts").reply(200, [
      { name: "BucketA", allocatedCapacity: 100 },
    ]);
    const res = await client.listPartnerStorageAccounts("P-1");
    expect(res[0].name).toBe("BucketA");
  });

  it("createPartnerStorageAccount() calls POST /partner/{id}/storage-accounts", async () => {
    mock.onPost("/partner/P-1/storage-accounts").reply((cfg) => [
      201,
      { name: JSON.parse(cfg.data).name, clientAccountId: "CA-1" },
    ]);
    const res = await client.createPartnerStorageAccount("P-1", {
      name: "NewBucket",
      allocatedCapacity: 200,
      allowOverdraft: false,
      clientAccount: { contactEmail: "dev@test.com", password: "P@ssw0rd!" },
    });
    expect(res.name).toBe("NewBucket");
    expect(res.clientAccountId).toBe("CA-1");
  });

  it("getPartnerStorageAccount() calls GET /partner/{id}/storage-accounts/{accountId}", async () => {
    mock
      .onGet("/partner/P-1/storage-accounts/ACC-1")
      .reply(200, { name: "BucketA", clientAccountId: "ACC-1" });
    const res = await client.getPartnerStorageAccount("P-1", "ACC-1");
    expect(res.clientAccountId).toBe("ACC-1");
  });

  it("deletePartnerStorageAccount() calls DELETE /partner/{id}/storage-accounts/{accountId}", async () => {
    mock.onDelete("/partner/P-1/storage-accounts/ACC-1").reply(204);
    await expect(
      client.deletePartnerStorageAccount("P-1", "ACC-1")
    ).resolves.toBeUndefined();
  });

  it("patchPartnerStorageAccount() calls PATCH /partner/{id}/storage-accounts/{accountId}", async () => {
    mock
      .onPatch("/partner/P-1/storage-accounts/ACC-1")
      .reply((cfg) => [200, { ...JSON.parse(cfg.data), name: "BucketA" }]);
    const res = await client.patchPartnerStorageAccount("P-1", "ACC-1", {
      pendingDeletedAt: "2026-04-01",
    });
    expect(res.pendingDeletedAt).toBe("2026-04-01");
  });

  // â”€â”€â”€ Distributors â€“ Usage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("getPartnerStorageAccountUsage() calls GET /partner/{id}/storage-accounts/{accountId}/usage", async () => {
    mock
      .onGet("/partner/P-1/storage-accounts/ACC-1/usage")
      .reply((cfg) => [
        200,
        { client_id: "ACC-1", daily_usage: [], from: cfg.params.from, to: cfg.params.to },
      ]);
    const res = await client.getPartnerStorageAccountUsage("P-1", "ACC-1", {
      from: "2026-01-01",
      to: "2026-01-31",
    }) as any;
    expect(res.client_id).toBe("ACC-1");
    expect(res.from).toBe("2026-01-01");
  });

  it("getPartnerUsage() calls GET /partner/{id}/usage with date params", async () => {
    mock
      .onGet("/partner/P-1/usage")
      .reply((cfg) => [200, [{ client_id: "ACC-1", allocated_capacity: 100, from: cfg.params.from }]]);
    const res = await client.getPartnerUsage("P-1", {
      from: "2026-02-01",
      to: "2026-02-28",
    }) as any;
    expect(res[0].from).toBe("2026-02-01");
  });

  // â”€â”€â”€ Partners â€“ Storage Accounts (self-service) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("createStorageAccount() calls POST /storage-account", async () => {
    mock.onPost("/storage-account").reply((cfg) => [
      201,
      { name: JSON.parse(cfg.data).name, clientAccountId: "CA-2" },
    ]);
    const res = await client.createStorageAccount({
      name: "MySelfBucket",
      allocatedCapacity: 50,
      allowOverdraft: true,
      clientAccount: { contactEmail: "me@test.com", password: "P@ssw0rd!" },
    });
    expect(res.name).toBe("MySelfBucket");
    expect(res.clientAccountId).toBe("CA-2");
  });

  it("listStorageAccounts() calls GET /storage-account/list", async () => {
    mock.onGet("/storage-account/list").reply(200, [
      { name: "Bucket1", clientAccountId: "CA-1" },
      { name: "Bucket2", clientAccountId: "CA-2" },
    ]);
    const res = await client.listStorageAccounts();
    expect(res).toHaveLength(2);
    expect(res[1].name).toBe("Bucket2");
  });

  it("getStorageAccount() calls GET /storage-account/{accountId}", async () => {
    mock
      .onGet("/storage-account/CA-1")
      .reply(200, { name: "Bucket1", clientAccountId: "CA-1" });
    const res = await client.getStorageAccount("CA-1");
    expect(res.clientAccountId).toBe("CA-1");
  });

  it("deleteStorageAccount() calls DELETE /storage-account/{accountId}", async () => {
    mock.onDelete("/storage-account/CA-1").reply(204);
    await expect(client.deleteStorageAccount("CA-1")).resolves.toBeUndefined();
  });

  it("patchStorageAccount() calls PATCH /storage-account/{accountId}", async () => {
    mock
      .onPatch("/storage-account/CA-1")
      .reply((cfg) => [200, { ...JSON.parse(cfg.data), name: "Bucket1" }]);
    const res = await client.patchStorageAccount("CA-1", { pendingDeletedAt: null });
    expect(res.pendingDeletedAt).toBeNull();
  });

  it("getStorageAccountUsage() calls GET /storage-account/{accountId}/usage with date params", async () => {
    mock
      .onGet("/storage-account/CA-1/usage")
      .reply((cfg) => [
        200,
        { client_id: "CA-1", daily_usage: [], params: cfg.params },
      ]);
    const res = await client.getStorageAccountUsage("CA-1", {
      from: "2026-03-01",
      to: "2026-03-31",
    }) as any;
    expect(res.params.from).toBe("2026-03-01");
    expect(res.params.to).toBe("2026-03-31");
  });

  it("getAllStorageAccountsUsage() calls GET /storage-accounts/usage", async () => {
    mock
      .onGet("/storage-accounts/usage")
      .reply((cfg) => [200, [{ client_id: "CA-1" }, { client_id: "CA-2" }]]);
    const res = await client.getAllStorageAccountsUsage({
      from: "2026-01-01",
      to: "2026-01-31",
    });
    expect(res).toHaveLength(2);
    expect(res[0].client_id).toBe("CA-1");
  });
});
