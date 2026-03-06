import { CustomAuthProvider } from "../../auth/CustomAuthProvider";

describe("CustomAuthProvider", () => {
  it("calls fetchToken with reason=initial on first call", async () => {
    const fetchToken = jest.fn().mockResolvedValue({ accessToken: "initial-tok", expiresAt: Date.now() + 3_600_000 });
    const provider = new CustomAuthProvider({ fetchToken });

    const token = await provider.getAccessToken();
    expect(token).toBe("initial-tok");
    expect(fetchToken).toHaveBeenCalledWith("initial");
  });

  it("returns cached token on second call (expiresAt in future)", async () => {
    const fetchToken = jest.fn().mockResolvedValue({
      accessToken: "cached-tok",
      expiresAt: Date.now() + 3_600_000,
    });
    const provider = new CustomAuthProvider({ fetchToken });

    await provider.getAccessToken();
    await provider.getAccessToken();

    expect(fetchToken).toHaveBeenCalledTimes(1);
  });

  it("treats token without expiresAt as single-use", async () => {
    const fetchToken = jest.fn().mockResolvedValue({ accessToken: "single-use" });
    const provider = new CustomAuthProvider({ fetchToken });

    await provider.getAccessToken();
    await provider.getAccessToken();

    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  it("calls fetchToken with reason=expired when token has expired", async () => {
    const fetchToken = jest.fn()
      .mockResolvedValueOnce({ accessToken: "old", expiresAt: 0 }) // expired immediately
      .mockResolvedValueOnce({ accessToken: "fresh", expiresAt: Date.now() + 3_600_000 });

    const provider = new CustomAuthProvider({ fetchToken });
    await provider.getAccessToken(); // initial
    const token = await provider.getAccessToken(); // expired → re-fetch

    expect(token).toBe("fresh");
    expect(fetchToken).toHaveBeenNthCalledWith(2, "expired");
  });

  it("calls fetchToken with reason=invalidated after invalidate()", async () => {
    const fetchToken = jest.fn()
      .mockResolvedValueOnce({ accessToken: "t1", expiresAt: Date.now() + 3_600_000 })
      .mockResolvedValueOnce({ accessToken: "t2", expiresAt: Date.now() + 3_600_000 });

    const provider = new CustomAuthProvider({ fetchToken });
    await provider.getAccessToken();
    provider.invalidate();
    const token = await provider.getAccessToken();

    expect(token).toBe("t2");
    expect(fetchToken).toHaveBeenNthCalledWith(2, "invalidated");
  });

  it("calls onInvalidate hook when invalidate() is called", () => {
    const onInvalidate = jest.fn();
    const fetchToken = jest.fn().mockResolvedValue({ accessToken: "t" });
    const provider = new CustomAuthProvider({ fetchToken, onInvalidate });

    provider.invalidate();
    expect(onInvalidate).toHaveBeenCalledTimes(1);
  });

  it("getCachedToken() returns null before first call", () => {
    const provider = new CustomAuthProvider({ fetchToken: jest.fn() });
    expect(provider.getCachedToken()).toBeNull();
  });

  it("getCachedToken() returns the cached result after getAccessToken()", async () => {
    const result = { accessToken: "x", expiresAt: Date.now() + 3_600_000 };
    const provider = new CustomAuthProvider({ fetchToken: jest.fn().mockResolvedValue(result) });
    await provider.getAccessToken();
    expect(provider.getCachedToken()).toEqual(result);
  });
});
