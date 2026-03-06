import axios from "axios";
import { AuthorizationCodeAuth } from "../../auth/AuthorizationCodeAuth";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const CFG = {
  clientId: "cid",
  clientSecret: "csecret",
  redirectUri: "https://myapp.com/callback",
};

const mockTokenRes = (accessToken = "at-1", refreshToken = "rt-1", expiresIn = 3600) => ({
  data: {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    token_type: "Bearer",
    scope: "all",
  },
  status: 200,
  headers: {},
  config: { headers: {} as any },
  statusText: "OK",
});

describe("AuthorizationCodeAuth", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── getAuthorizationUrl ─────────────────────────────────────────────────────

  describe("getAuthorizationUrl()", () => {
    it("returns a URL containing required OAuth params", () => {
      const auth = new AuthorizationCodeAuth(CFG);
      const url = auth.getAuthorizationUrl("ZohoCRM.modules.ALL");

      expect(url).toContain("https://accounts.zoho.com/oauth/v2/auth");
      expect(url).toContain("response_type=code");
      expect(url).toContain("client_id=cid");
      expect(url).toContain("redirect_uri=");
      expect(url).toContain("access_type=offline");
      expect(url).toContain("scope=ZohoCRM.modules.ALL");
    });

    it("includes state parameter when provided", () => {
      const auth = new AuthorizationCodeAuth(CFG);
      const url = auth.getAuthorizationUrl("scope", "csrf-state");
      expect(url).toContain("state=csrf-state");
    });
  });

  // ── exchangeCode ────────────────────────────────────────────────────────────

  describe("exchangeCode()", () => {
    it("exchanges code for tokens and caches them", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue(mockTokenRes("at-1", "rt-1"));
      const auth = new AuthorizationCodeAuth(CFG);
      const tokens = await auth.exchangeCode("one-time-code");

      expect(tokens.accessToken).toBe("at-1");
      expect(tokens.refreshToken).toBe("rt-1");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "https://accounts.zoho.com/oauth/v2/token",
        expect.stringContaining("grant_type=authorization_code"),
        expect.any(Object)
      );
    });

    it("throws when no refresh_token is returned", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue({
        data: { access_token: "at", expires_in: 3600, token_type: "Bearer", scope: "all" },
        status: 200,
      });
      const auth = new AuthorizationCodeAuth(CFG);
      await expect(auth.exchangeCode("code")).rejects.toThrow("No refresh_token");
    });
  });

  // ── getAccessToken with initialTokens ───────────────────────────────────────

  describe("getAccessToken()", () => {
    it("returns initial access token without network call when still valid", async () => {
      const auth = new AuthorizationCodeAuth(CFG, {
        accessToken: "pre-loaded-at",
        refreshToken: "pre-loaded-rt",
        expiresAt: Date.now() + 3_600_000,
      });
      const token = await auth.getAccessToken();
      expect(token).toBe("pre-loaded-at");
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it("refreshes silently when access token expires", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue(mockTokenRes("refreshed-at", "rt-2"));
      const auth = new AuthorizationCodeAuth(CFG, {
        accessToken: "expired-at",
        refreshToken: "rt-1",
        expiresAt: 0, // already expired
      });
      const token = await auth.getAccessToken();
      expect(token).toBe("refreshed-at");
    });

    it("throws when no tokens are available", async () => {
      const auth = new AuthorizationCodeAuth(CFG);
      await expect(auth.getAccessToken()).rejects.toThrow(
        "No tokens available. Call exchangeCode() first."
      );
    });

    it("invalidate() clears the access token but keeps the refresh token", async () => {
      mockedAxios.post = jest.fn().mockResolvedValue(mockTokenRes("new-at", "rt-1"));
      const auth = new AuthorizationCodeAuth(CFG, {
        accessToken: "old-at",
        refreshToken: "rt-1",
        expiresAt: Date.now() + 3_600_000,
      });
      auth.invalidate();
      const token = await auth.getAccessToken();
      expect(token).toBe("new-at");
    });
  });

  // ── getCachedTokens ─────────────────────────────────────────────────────────

  it("getCachedTokens() returns null before any token is obtained", () => {
    const auth = new AuthorizationCodeAuth(CFG);
    expect(auth.getCachedTokens()).toBeNull();
  });
});
