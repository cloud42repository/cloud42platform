import axios from "axios";
import { DeviceFlowAuth } from "../../auth/DeviceFlowAuth";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.useFakeTimers();

const CFG = { clientId: "cid", clientSecret: "csecret" };

const deviceCodeRes = {
  device_code: "dev-code-123",
  user_code: "USER-1234",
  verification_url: "https://accounts.zoho.com/device",
  expires_in: 300,
  interval: 0, // 0 so tests don't have to advance timers
};

const tokenRes = (at = "device-at", rt = "device-rt") => ({
  data: { access_token: at, refresh_token: rt, expires_in: 3600, token_type: "Bearer", scope: "all" },
  status: 200,
  headers: {},
  config: { headers: {} as any },
  statusText: "OK",
});

describe("DeviceFlowAuth", () => {
  beforeEach(() => jest.clearAllMocks());

  afterAll(() => jest.useRealTimers());

  // ── startFlow ───────────────────────────────────────────────────────────────

  it("startFlow() calls onPrompt with device code info and resolves tokens", async () => {
    mockedAxios.post = jest.fn()
      .mockResolvedValueOnce({ data: deviceCodeRes, status: 200 }) // device code request
      .mockResolvedValueOnce(tokenRes()); // polling

    const onPrompt = jest.fn().mockResolvedValue(undefined);
    const auth = new DeviceFlowAuth(CFG);

    const promise = auth.startFlow("ZohoCRM.modules.ALL", onPrompt);
    // advance the polling interval (0s here)
    jest.runAllTimersAsync();
    const tokens = await promise;

    expect(onPrompt).toHaveBeenCalledWith(expect.objectContaining({ user_code: "USER-1234" }));
    expect(tokens.accessToken).toBe("device-at");
    expect(tokens.refreshToken).toBe("device-rt");
  });

  it("startFlow() keeps polling on authorization_pending", async () => {
    mockedAxios.post = jest.fn()
      .mockResolvedValueOnce({ data: deviceCodeRes, status: 200 })
      .mockResolvedValueOnce({ data: { error: "authorization_pending" }, status: 200 })
      .mockResolvedValueOnce(tokenRes("final-at"));

    const auth = new DeviceFlowAuth(CFG);
    const promise = auth.startFlow("scope", jest.fn().mockResolvedValue(undefined));
    jest.runAllTimersAsync();
    const tokens = await promise;

    expect(tokens.accessToken).toBe("final-at");
    expect(mockedAxios.post).toHaveBeenCalledTimes(3); // 1 device code + 2 polls
  });

  // ── getAccessToken with initialTokens ───────────────────────────────────────

  describe("getAccessToken()", () => {
    it("returns initial token without network call when still valid", async () => {
      const auth = new DeviceFlowAuth(CFG, {
        accessToken: "pre-at",
        refreshToken: "pre-rt",
        expiresAt: Date.now() + 3_600_000,
      });
      expect(await auth.getAccessToken()).toBe("pre-at");
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("silently re-refreshes when expired", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue(tokenRes("refreshed-at"));
      const auth = new DeviceFlowAuth(CFG, {
        accessToken: "old",
        refreshToken: "rt-1",
        expiresAt: 0,
      });
      const token = await auth.getAccessToken();
      expect(token).toBe("refreshed-at");
    });

    it("throws when no tokens available and startFlow() not called", async () => {
      const auth = new DeviceFlowAuth(CFG);
      await expect(auth.getAccessToken()).rejects.toThrow("Call startFlow() first");
    });
  });

  // ── invalidate ──────────────────────────────────────────────────────────────

  it("invalidate() forces re-fetch on next getAccessToken()", async () => {
    mockedAxios.post = jest.fn().mockResolvedValue(tokenRes("new-at"));
    const auth = new DeviceFlowAuth(CFG, {
      accessToken: "old-at",
      refreshToken: "rt",
      expiresAt: Date.now() + 3_600_000,
    });
    auth.invalidate();
    const token = await auth.getAccessToken();
    expect(token).toBe("new-at");
  });
});
