import axios from "axios";
import { ClientCredentialsAuth } from "../../auth/ClientCredentialsAuth";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const BASE_CFG = {
  clientId: "client-id",
  clientSecret: "client-secret",
  scope: "ZohoCRM.modules.ALL",
};

const mockToken = (token = "cc-token", expiresIn = 3600) => ({
  data: { access_token: token, expires_in: expiresIn, token_type: "Bearer", scope: BASE_CFG.scope },
  status: 200,
  headers: {},
  config: { headers: {} as any },
  statusText: "OK",
});

describe("ClientCredentialsAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post = jest.fn().mockResolvedValue(mockToken());
  });

  it("requests a token with grant_type=client_credentials", async () => {
    const provider = new ClientCredentialsAuth(BASE_CFG);
    const token = await provider.getAccessToken();

    expect(token).toBe("cc-token");
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://accounts.zoho.com/oauth/v2/token",
      expect.stringContaining("grant_type=client_credentials"),
      expect.any(Object)
    );
  });

  it("includes client_id, client_secret, and scope in the request body", async () => {
    const provider = new ClientCredentialsAuth(BASE_CFG);
    await provider.getAccessToken();

    const body: string = (mockedAxios.post as jest.Mock).mock.calls[0][1];
    expect(body).toContain("client_id=client-id");
    expect(body).toContain("client_secret=client-secret");
    expect(body).toContain("scope=ZohoCRM.modules.ALL");
  });

  it("caches the token and does not refetch on second call", async () => {
    const provider = new ClientCredentialsAuth(BASE_CFG);
    await provider.getAccessToken();
    await provider.getAccessToken();

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after invalidate()", async () => {
    mockedAxios.post = jest.fn()
      .mockResolvedValueOnce(mockToken("t1"))
      .mockResolvedValueOnce(mockToken("t2"));

    const provider = new ClientCredentialsAuth(BASE_CFG);
    await provider.getAccessToken();
    provider.invalidate();
    const second = await provider.getAccessToken();

    expect(second).toBe("t2");
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it("re-fetches when token expires", async () => {
    mockedAxios.post = jest.fn()
      .mockResolvedValueOnce(mockToken("old", 0))
      .mockResolvedValueOnce(mockToken("new", 3600));

    const provider = new ClientCredentialsAuth(BASE_CFG);
    await provider.getAccessToken();
    const token = await provider.getAccessToken();

    expect(token).toBe("new");
  });

  it("throws on server-side error", async () => {
    mockedAxios.post = jest.fn().mockResolvedValue({
      data: { error: "access_denied", error_description: "not allowed" },
      status: 200,
    });

    const provider = new ClientCredentialsAuth(BASE_CFG);
    await expect(provider.getAccessToken()).rejects.toThrow(
      "[ClientCredentialsAuth] access_denied: not allowed"
    );
  });

  it("uses custom accountsUrl", async () => {
    const provider = new ClientCredentialsAuth({
      ...BASE_CFG,
      accountsUrl: "https://accounts.zoho.in",
    });
    await provider.getAccessToken();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://accounts.zoho.in/oauth/v2/token",
      expect.any(String),
      expect.any(Object)
    );
  });
});
