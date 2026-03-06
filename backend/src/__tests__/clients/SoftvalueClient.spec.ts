import MockAdapter from "axios-mock-adapter";
import { SoftvalueClient, SoftvalueApiError } from "../../softvalue/SoftvalueClient";

const makeClient = (extra?: Partial<ConstructorParameters<typeof SoftvalueClient>[0]>) =>
  new SoftvalueClient({
    token: "sv-bearer",
    baseUrl: "https://api.softvalue.test/v1",
    ...extra,
  });

describe("SoftvalueClient", () => {
  let client: SoftvalueClient;
  let mock: MockAdapter;

  beforeEach(() => {
    client = makeClient();
    mock = new MockAdapter(client.axiosInstance);
  });

  afterEach(() => mock.restore());

  // â”€â”€ Authorization header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("injects Bearer token in Authorization header", async () => {
    mock.onGet("/items").reply((config) => [
      200,
      { auth: config.headers?.["Authorization"] },
    ]);
    const res = await client.get<{ auth: string }>("/items");
    expect(res.auth).toBe("Bearer sv-bearer");
  });

  // â”€â”€ HTTP methods â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("get() returns deserialized response data", async () => {
    mock.onGet("/items").reply(200, [{ id: 1 }, { id: 2 }]);
    const data = await client.get<{ id: number }[]>("/items");
    expect(data).toHaveLength(2);
  });

  it("post() sends body and returns response", async () => {
    mock.onPost("/items").reply((config) => [201, { created: JSON.parse(config.data) }]);
    const res = await client.post<{ created: object }>("/items", { name: "Widget" });
    expect(res.created).toEqual({ name: "Widget" });
  });

  it("put() sends body and returns response", async () => {
    mock.onPut("/items/1").reply((config) => [200, { updated: JSON.parse(config.data) }]);
    const res = await client.put<{ updated: object }>("/items/1", { name: "Updated" });
    expect(res.updated).toEqual({ name: "Updated" });
  });

  it("patch() sends body and returns response", async () => {
    mock.onPatch("/items/1").reply((config) => [200, { patched: JSON.parse(config.data) }]);
    const res = await client.patch<{ patched: object }>("/items/1", { active: false });
    expect(res.patched).toEqual({ active: false });
  });

  it("delete() returns response data", async () => {
    mock.onDelete("/items/1").reply(200, { deleted: true });
    const res = await client.delete<{ deleted: boolean }>("/items/1");
    expect(res.deleted).toBe(true);
  });

  // â”€â”€ Token management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("updateToken() rotates the token used in subsequent requests", async () => {
    client.updateToken("new-token");
    mock.onGet("/secure").reply((config) => [200, { auth: config.headers?.["Authorization"] }]);
    const res = await client.get<{ auth: string }>("/secure");
    expect(res.auth).toBe("Bearer new-token");
    expect(client.getToken()).toBe("new-token");
  });

  // â”€â”€ 401 retry â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("retries once on 401 when onUnauthorized returns a new token", async () => {
    let callCount = 0;
    mock.onGet("/secret").reply(() => {
      callCount++;
      if (callCount === 1) return [401, { message: "Unauthorized" }];
      return [200, { data: "success" }];
    });

    const onUnauthorized = jest.fn().mockResolvedValue("rotated-token");
    const retryClient = makeClient({ onUnauthorized });
    const retryMock = new MockAdapter(retryClient.axiosInstance);
    let innerCount = 0;
    retryMock.onGet("/secret").reply(() => {
      innerCount++;
      if (innerCount === 1) return [401, {}];
      return [200, { data: "ok" }];
    });

    const res = await retryClient.get<{ data: string }>("/secret");
    expect(res.data).toBe("ok");
    expect(onUnauthorized).toHaveBeenCalledWith("sv-bearer");
    expect(retryClient.getToken()).toBe("rotated-token");
    retryMock.restore();
  });

  it("does NOT retry more than once on repeated 401", async () => {
    let calls = 0;
    mock.onGet("/always-401").reply(() => {
      calls++;
      return [401, { message: "Unauthorized" }];
    });

    await expect(client.get("/always-401")).rejects.toBeDefined();
    expect(calls).toBe(2); // original + one retry
  });

  // â”€â”€ SoftvalueApiError â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("wraps HTTP error responses in SoftvalueApiError", async () => {
    mock.onGet("/not-found").reply(404, { message: "Not found" });

    await expect(client.get("/not-found")).rejects.toBeInstanceOf(SoftvalueApiError);
    await expect(client.get("/not-found")).rejects.toMatchObject({
      status: 404,
      message: "[Softvalue 404] Not found",
    });
  });

  it("SoftvalueApiError.name is 'SoftvalueApiError'", async () => {
    mock.onGet("/err").reply(500, { error: "Internal error" });
    try {
      await client.get("/err");
    } catch (e) {
      expect((e as SoftvalueApiError).name).toBe("SoftvalueApiError");
    }
  });

  // â”€â”€ axiosInstance getter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  it("axiosInstance getter exposes the underlying Axios instance", () => {
    expect(typeof client.axiosInstance.get).toBe("function");
  });
});
