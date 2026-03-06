import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { ZohoProductConfig } from "./types";
import { IAuthProvider } from "../auth/IAuthProvider";
import { OAuthRefreshProvider } from "../auth/OAuthRefreshProvider";
import { MockAuthProvider } from "../mock/mock-auth-provider";
import { attachMockAdapter } from "../mock/mock-adapter";

const MOCK_MODE = process.env['MOCK_MODE'] === 'true';

// ─── Custom Error ─────────────────────────────────────────────────────────────

export class ZohoApiError extends Error {
  constructor(
    message: string,
    public readonly code: number,
    public readonly response: AxiosResponse
  ) {
    super(`[Zoho ${code}] ${message}`);
    this.name = "ZohoApiError";
  }
}

// ─── Base Client ──────────────────────────────────────────────────────────────

/**
 * Generic Zoho OAuth2 Axios client.
 *
 * All product-specific clients extend this class.
 * Accepts any IAuthProvider (OAuthRefreshProvider, ClientCredentialsAuth,
 * AuthorizationCodeAuth, PKCEAuth, DeviceFlowAuth, PassthroughAuth…).
 * A failed 401 is retried once after invalidating the provider's cache.
 */
export abstract class ZohoBaseClient {
  protected readonly http: AxiosInstance;
  private readonly auth: IAuthProvider;

  constructor(config: ZohoProductConfig) {
    // ── Mock mode: bypass real auth and real HTTP calls ────────────────────────
    if (MOCK_MODE) {
      this.auth = new MockAuthProvider();
    } else if (config.authProvider) {
      // If the caller provides an explicit auth provider, use it.
      this.auth = config.authProvider;
    } else {
      // Fall back to the classic refresh-token flow.
      if (!config.refreshToken) {
        throw new Error(
          "ZohoBaseClient: supply either `authProvider` or `refreshToken` in the config."
        );
      }
      this.auth = new OAuthRefreshProvider({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        oauthRefreshToken: config.refreshToken,
        accountsUrl: config.accountsUrl,
      });
    }

    this.http = axios.create({
      baseURL: config.apiBaseUrl ?? (MOCK_MODE ? 'http://mock.local' : undefined),
      headers: { "Content-Type": "application/json;charset=UTF-8" },
      params: { ...(config.defaultParams ?? {}) },
    });

    this.attachInterceptors();

    // Attach mock adapter AFTER interceptors so the stub adapter handles the final request
    if (MOCK_MODE) {
      attachMockAdapter(this.http);
    }
  }

  // ── Interceptors ─────────────────────────────────────────────────────────────

  private attachInterceptors(): void {
    this.http.interceptors.request.use(
      async (req: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const token = await this.auth.getAccessToken();
        req.headers.set("Authorization", `Zoho-oauthtoken ${token}`);
        return req;
      },
      (err: unknown) => Promise.reject(err)
    );

    this.http.interceptors.response.use(
      (res: AxiosResponse) => {
        const body = res.data as { code?: number; message?: string } | undefined;
        if (body && typeof body.code === "number" && body.code !== 0) {
          return Promise.reject(
            new ZohoApiError(body.message ?? "Zoho API error", body.code, res)
          );
        }
        return res;
      },
      async (err: AxiosError) => {
        const req = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        if (err.response?.status === 401 && req && !req._retry) {
          req._retry = true;
          this.auth.invalidate();
          const token = await this.auth.getAccessToken();
          req.headers.set("Authorization", `Zoho-oauthtoken ${token}`);
          return this.http(req);
        }
        return Promise.reject(err);
      }
    );
  }

  /** Expose the underlying auth provider (e.g. to call exchangeCode()). */
  get authProvider(): IAuthProvider {
    return this.auth;
  }

  // ── Public HTTP helpers ───────────────────────────────────────────────────────

  async get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.get<T>(path, config)).data;
  }

  async post<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.post<T>(path, data, config)).data;
  }

  async put<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.put<T>(path, data, config)).data;
  }

  async patch<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.patch<T>(path, data, config)).data;
  }

  async delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.delete<T>(path, config)).data;
  }

  /** Raw Axios instance for advanced use (file uploads, streaming, etc.) */
  get axiosInstance(): AxiosInstance {
    return this.http;
  }
}
