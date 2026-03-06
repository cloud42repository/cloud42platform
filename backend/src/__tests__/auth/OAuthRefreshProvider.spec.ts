import axios from "axios";
import { OAuthRefreshProvider } from "../../auth/OAuthRefreshProvider";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const BASE_CFG = {
  clientId: "client-id",
  clientSecret: "client-secret",
  oauthRefreshToken: "refresh-token",
};

const makeTokenResponse = (accessToken = "access-abc", expiresIn = 3600) => ({
  data: { access_token: accessToken, expires_in: expiresIn, token_type: "Bearer", scope: "all" },
  status: 200,
  headers: {},
  config: { headers: {} as any },
  statusText: "OK",
});

describe("OAuthRefreshProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.post = jest.fn().mockResolvedValue(makeTokenResponse());
  });

  it("fetches an access token on first call", async () => {
    const provider = new OAuthRefreshProvider(BASE_CFG);
    const token = await provider.getAccessToken();

    expect(token).toBe("access-abc");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://accounts.zoho.com/oauth/v2/token",
      expect.stringContaining("grant_type=refresh_token"),
      expect.any(Object)
    );
  });

  it("returns cached token without re-fetching", async () => {
    const provider = new OAuthRefreshProvider(BASE_CFG);
    await provider.getAccessToken();
    const token = await provider.getAccessToken();

    expect(token).toBe("access-abc");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1); // cached
  });

  it("re-fetches after invalidate()", async () => {
    mockedAxios.post = jest.fn()
      .mockResolvedValueOnce(makeTokenResponse("token-1"))
      .mockResolvedValueOnce(makeTokenResponse("token-2"));

    const provider = new OAuthRefreshProvider(BASE_CFG);
    await provider.getAccessToken();
    provider.invalidate();
    const second = await provider.getAccessToken();

    expect(second).toBe("token-2");
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it("re-fetches when token is expired", async () => {
    mockedAxios.post = jest.fn()
      .mockResolvedValueOnce(makeTokenResponse("old", 0)) // expires immediately
      .mockResolvedValueOnce(makeTokenResponse("new", 3600));

    const provider = new OAuthRefreshProvider(BASE_CFG);
    await provider.getAccessToken();
    const second = await provider.getAccessToken();

    expect(second).toBe("new");
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  it("uses custom accountsUrl", async () => {
    const provider = new OAuthRefreshProvider({
      ...BASE_CFG,
      accountsUrl: "https://accounts.zoho.eu",
    });
    await provider.getAccessToken();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://accounts.zoho.eu/oauth/v2/token",
      expect.any(String),
      expect.any(Object)
    );
  });

  it("throws when the server returns an error", async () => {
    mockedAxios.post = jest.fn().mockResolvedValue({
      data: { error: "invalid_client", error_description: "bad credentials" },
      status: 200,
    });

    const provider = new OAuthRefreshProvider(BASE_CFG);
    await expect(provider.getAccessToken()).rejects.toThrow(
      "[OAuthRefreshProvider] invalid_client: bad credentials"
    );
  });
});
