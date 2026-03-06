import MockAdapter from "axios-mock-adapter";
import { ZohoBaseClient } from "../../base/ZohoBaseClient";
import { ZohoApiError } from "../../base/ZohoBaseClient";
import { PassthroughAuth } from "../../auth/PassthroughAuth";
import { CustomAuthProvider } from "../../auth/CustomAuthProvider";

// ── Concrete subclass for testing (ZohoBaseClient is abstract) ─────────────────

class TestClient extends ZohoBaseClient {}

const makeClient = (token = "test-token", extraConfig?: Record<string, unknown>) =>
  new TestClient({
    clientId: "cid",
    clientSecret: "csecret",
    apiBaseUrl: "https://api.zoho.test/v1",
    authProvider: new PassthroughAuth(token),
    ...extraConfig,
  } as any);

describe("ZohoBaseClient", () => {
  let client: TestClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  // ── Constructor validation ─────────────────────────────────────────────────

  it("throws when neither authProvider nor refreshToken is supplied", () => {
    expect(() =>
      new TestClient({ clientId: "c", clientSecret: "s", apiBaseUrl: "https://x.com" })
    ).toThrow("supply either `authProvider` or `refreshToken`");
  });

  it("does not throw when refreshToken is supplied (no authProvider)", () => {
    expect(() =>
      new TestClient({
        clientId: "c",
        clientSecret: "s",
        apiBaseUrl: "https://x.com",
        refreshToken: "rt",
      })
    ).not.toThrow();
  });

  // ── Authorization header ───────────────────────────────────────────────────

  it("injects Zoho-oauthtoken Authorization header on each request", async () => {
    mock.onGet("/records").reply((config) => {
      return [200, { code: 0, message: "ok", authorization: config.headers?.["Authorization"] }];
    });

    const res = await client.get<{ authorization: string }>("/records");
    expect(res.authorization).toBe("Zoho-oauthtoken test-token");
  });

  // ── ZohoApiError ───────────────────────────────────────────────────────────

  it("rejects with ZohoApiError when response body code !== 0", async () => {
    mock.onGet("/records").reply(200, { code: 4001, message: "INVALID_TOKEN" });

    await expect(client.get("/records")).rejects.toBeInstanceOf(ZohoApiError);
    await expect(client.get("/records")).rejects.toMatchObject({
      code: 4001,
      message: "[Zoho 4001] INVALID_TOKEN",
    });
  });

  it("does NOT reject when response body has no code field", async () => {
    mock.onGet("/ping").reply(200, { status: "ok" });
    await expect(client.get("/ping")).resolves.toEqual({ status: "ok" });
  });

  // ── 401 retry ─────────────────────────────────────────────────────────────

  it("retries once after 401 and succeeds with the refreshed token", async () => {
    let callCount = 0;
    mock.onGet("/secure").reply(() => {
      callCount++;
      if (callCount === 1) return [401, { message: "Unauthorized" }];
      return [200, { code: 0, data: "protected-data" }];
    });

    // Use a CustomAuthProvider that rotates the token on invalidate
    let tokenIndex = 0;
    const tokens = ["expired-token", "new-token"];
    const auth = new CustomAuthProvider({
      fetchToken: async () => ({ accessToken: tokens[tokenIndex], expiresAt: Date.now() + 3_600_000 }),
      onInvalidate: () => { tokenIndex = 1; },
    });

    const retryClient = new TestClient({
      clientId: "c",
      clientSecret: "s",
      apiBaseUrl: "https://api.zoho.test/v1",
      authProvider: auth,
    });
    const retryMock = new MockAdapter(retryClient.axiosInstance);
    let innerCount = 0;
    retryMock.onGet("/secure").reply(() => {
      innerCount++;
      if (innerCount === 1) return [401, {}];
      return [200, { code: 0, data: "ok" }];
    });

    const result = await retryClient.get<{ data: string }>("/secure");
    expect(result.data).toBe("ok");
    expect(innerCount).toBe(2);
    retryMock.restore();
  });

  it("does NOT retry more than once on 401", async () => {
    let calls = 0;
    mock.onGet("/always-401").reply(() => {
      calls++;
      return [401, { message: "Unauthorized" }];
    });

    await expect(client.get("/always-401")).rejects.toBeDefined();
    expect(calls).toBe(2); // original + one retry
  });

  // ── HTTP methods ───────────────────────────────────────────────────────────

  it("get() returns response data", async () => {
    mock.onGet("/items").reply(200, { code: 0, items: [1, 2, 3] });
    const data = await client.get<{ items: number[] }>("/items");
    expect(data.items).toEqual([1, 2, 3]);
  });

  it("post() sends body and returns response data", async () => {
    mock.onPost("/items").reply((config) => [200, { code: 0, sent: JSON.parse(config.data) }]);
    const result = await client.post<{ sent: { name: string } }>("/items", { name: "new" });
    expect(result.sent.name).toBe("new");
  });

  it("put() sends body and returns response data", async () => {
    mock.onPut("/items/1").reply((config) => [200, { code: 0, updated: JSON.parse(config.data) }]);
    const result = await client.put<{ updated: { name: string } }>("/items/1", { name: "updated" });
    expect(result.updated.name).toBe("updated");
  });

  it("patch() sends body and returns response data", async () => {
    mock.onPatch("/items/1").reply((config) => [200, { code: 0, patched: JSON.parse(config.data) }]);
    const result = await client.patch<{ patched: object }>("/items/1", { active: true });
    expect(result.patched).toEqual({ active: true });
  });

  it("delete() returns response data", async () => {
    mock.onDelete("/items/1").reply(200, { code: 0, deleted: true });
    const result = await client.delete<{ deleted: boolean }>("/items/1");
    expect(result.deleted).toBe(true);
  });

  // ── defaultParams ──────────────────────────────────────────────────────────

  it("appends defaultParams to every request", async () => {
    const paramClient = makeClient("tk", { defaultParams: { organization_id: "org-99" } });
    const paramMock = new MockAdapter(paramClient.axiosInstance);
    paramMock.onGet("/invoices").reply((config) => [200, { code: 0, params: config.params }]);

    const result = await paramClient.get<{ params: Record<string, string> }>("/invoices");
    expect(result.params.organization_id).toBe("org-99");
    paramMock.restore();
  });

  // ── authProvider getter ────────────────────────────────────────────────────

  it("authProvider getter exposes the IAuthProvider instance", () => {
    const auth = new PassthroughAuth("tok");
    const c = new TestClient({
      clientId: "c", clientSecret: "s",
      apiBaseUrl: "https://x.com",
      authProvider: auth,
    });
    expect(c.authProvider).toBe(auth);
  });

  // ── axiosInstance getter ───────────────────────────────────────────────────

  it("axiosInstance getter returns the underlying Axios instance", () => {
    expect(client.axiosInstance).toBeDefined();
    expect(typeof client.axiosInstance.get).toBe("function");
  });
});
