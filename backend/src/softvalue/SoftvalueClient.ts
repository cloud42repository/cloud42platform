import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { attachMockAdapter } from "../mock/mock-adapter";

const MOCK_MODE = process.env['MOCK_MODE'] === 'true';

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SoftvalueClientConfig {
  /**
   * Bearer token used for every request.
   * Call updateToken() at runtime to rotate it.
   */
  token: string;
  /**
   * Base URL of the Softvalue API.
   * Defaults to https://api.softvalue.com/v1
   */
  baseUrl?: string;
  /**
   * Optional timeout per request in milliseconds.
   * Defaults to 30 000 ms.
   */
  timeout?: number;
  /**
   * Optional hook invoked whenever a 401 is received.
   * Use it to rotate the token before the automatic retry.
   * Return the new token string; returning undefined keeps the current one.
   */
  onUnauthorized?: (currentToken: string) => Promise<string | undefined>;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class SoftvalueApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: AxiosResponse
  ) {
    super(`[Softvalue ${status}] ${message}`);
    this.name = "SoftvalueApiError";
  }
}

// ─── Client ───────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = "https://api.softvalue.com/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Softvalue API client.
 *
 * Authenticates every request with a Bearer token.
 * If a 401 is received the `onUnauthorized` hook is called (if provided)
 * to allow token rotation, then the request is retried once automatically.
 *
 * @example
 * ```ts
 * const sv = new SoftvalueClient({
 *   token: process.env.SOFTVALUE_TOKEN!,
 *   baseUrl: "https://api.softvalue.com/v1",
 * });
 *
 * const items = await sv.get<Item[]>("/items");
 * const created = await sv.post<Item>("/items", { name: "New item" });
 * ```
 */
export class SoftvalueClient {
  private readonly http: AxiosInstance;
  private token: string;
  private readonly cfg: SoftvalueClientConfig;

  constructor(config: SoftvalueClientConfig) {
    this.cfg = config;
    this.token = config.token;

    this.http = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.attachInterceptors();

    if (MOCK_MODE) {
      attachMockAdapter(this.http);
    }
  }

  // ── Interceptors ─────────────────────────────────────────────────────────────

  private attachInterceptors(): void {
    // Request: inject Bearer token
    this.http.interceptors.request.use(
      (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        req.headers.set("Authorization", `Bearer ${this.token}`);
        return req;
      },
      (err: unknown) => Promise.reject(err)
    );

    // Response: surface errors clearly + handle 401 with one retry
    this.http.interceptors.response.use(
      (res: AxiosResponse) => res,
      async (err: AxiosError) => {
        const req = err.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (err.response?.status === 401 && req && !req._retry) {
          req._retry = true;

          // Give the caller a chance to supply a fresh token
          if (this.cfg.onUnauthorized) {
            const newToken = await this.cfg.onUnauthorized(this.token);
            if (newToken) this.token = newToken;
          }

          req.headers.set("Authorization", `Bearer ${this.token}`);
          return this.http(req);
        }

        // Wrap ≥400 responses in a typed error
        if (err.response) {
          const body = err.response.data as { message?: string; error?: string } | undefined;
          const message = body?.message ?? body?.error ?? err.message;
          return Promise.reject(
            new SoftvalueApiError(message, err.response.status, err.response)
          );
        }

        return Promise.reject(err);
      }
    );
  }

  // ── Token management ──────────────────────────────────────────────────────────

  /** Replace the Bearer token at runtime (e.g. after a rotation). */
  updateToken(newToken: string): void {
    this.token = newToken;
  }

  /** Returns the current Bearer token in use. */
  getToken(): string {
    return this.token;
  }

  // ── HTTP helpers ──────────────────────────────────────────────────────────────

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

  /** Raw Axios instance for advanced use (file uploads, streaming, etc.). */
  get axiosInstance(): AxiosInstance {
    return this.http;
  }
}
