import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { attachMockAdapter } from '../mock/mock-adapter';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatGPTModel,
  ChatGPTModelListResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ImageGenerateRequest,
  ImageResponse,
  ModerationRequest,
  ModerationResponse,
  TranscriptionResponse,
} from './chatgpt.dto';

// ─── Config ───────────────────────────────────────────────────────────────────

export interface ChatGPTClientConfig {
  /**
   * OpenAI API key.
   * Sent as: `Authorization: Bearer <apiKey>`
   */
  apiKey: string;
  /**
   * Optional organization ID.
   * Sent as: `OpenAI-Organization: <orgId>`
   */
  orgId?: string;
  /**
   * Override the full API base URL.
   * Defaults to https://api.openai.com/v1
   */
  baseUrl?: string;
  /** Request timeout in milliseconds.  Defaults to 60 000. */
  timeout?: number;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class ChatGPTApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: unknown,
  ) {
    super(`[ChatGPT ${status}] ${message}`);
    this.name = 'ChatGPTApiError';
  }
}

// ─── Client ───────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env['MOCK_MODE'] === 'true';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_TIMEOUT_MS = 60_000;

/**
 * OpenAI / ChatGPT API client.
 *
 * Covers the main API endpoints:
 *   – Models      (list, retrieve)
 *   – Chat        (completions)
 *   – Embeddings  (create)
 *   – Images      (generate)
 *   – Moderations (create)
 *
 * Authentication is done via a Bearer token:
 *   `Authorization: Bearer <apiKey>`
 *
 * @example
 * ```ts
 * const gpt = new ChatGPTClient({
 *   apiKey: process.env.OPENAI_API_KEY!,
 * });
 *
 * const reply = await gpt.createChatCompletion({
 *   model: 'gpt-4o',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 * });
 * ```
 */
export class ChatGPTClient {
  private readonly http: AxiosInstance;
  private apiKey: string;
  private orgId?: string;

  constructor(config: ChatGPTClientConfig) {
    this.apiKey = config.apiKey;
    this.orgId = config.orgId;

    this.http = axios.create({
      baseURL: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });

    this.attachInterceptors();

    if (MOCK_MODE) {
      attachMockAdapter(this.http);
    }
  }

  // ── Interceptors ──────────────────────────────────────────────────────────

  private attachInterceptors(): void {
    this.http.interceptors.request.use(
      (req: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        req.headers.set('Authorization', `Bearer ${this.apiKey}`);
        if (this.orgId) {
          req.headers.set('OpenAI-Organization', this.orgId);
        }
        return req;
      },
      (err: unknown) => Promise.reject(err),
    );

    this.http.interceptors.response.use(
      (res) => res,
      async (err: AxiosError) => {
        const status = err.response?.status ?? 0;
        const data = err.response?.data;
        const errObj = data as { error?: { message?: string } } | undefined;
        const message =
          errObj?.error?.message ?? err.message ?? 'Unknown error';
        return Promise.reject(new ChatGPTApiError(message, status, data));
      },
    );
  }

  // ── Generic HTTP helpers ──────────────────────────────────────────────────

  async get<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.get<T>(path, config)).data;
  }

  async post<T = unknown>(path: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.post<T>(path, data, config)).data;
  }

  async delete<T = unknown>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return (await this.http.delete<T>(path, config)).data;
  }

  /** Raw Axios instance — useful for tests and advanced use-cases. */
  get axiosInstance(): AxiosInstance {
    return this.http;
  }

  /** Update the API key at runtime (e.g. key rotation). */
  updateApiKey(newKey: string): void {
    this.apiKey = newKey;
  }

  // ── Models ────────────────────────────────────────────────────────────────

  /**
   * GET /models
   * Lists all available models.
   */
  listModels(): Promise<ChatGPTModelListResponse> {
    return this.get('/models');
  }

  /**
   * GET /models/{model}
   * Retrieves details of a specific model.
   */
  getModel(modelId: string): Promise<ChatGPTModel> {
    return this.get(`/models/${modelId}`);
  }

  // ── Chat Completions ──────────────────────────────────────────────────────

  /**
   * POST /chat/completions
   * Creates a chat completion.
   */
  createChatCompletion(body: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    return this.post('/chat/completions', body);
  }

  // ── Embeddings ────────────────────────────────────────────────────────────

  /**
   * POST /embeddings
   * Creates an embedding vector for the given input.
   */
  createEmbedding(body: EmbeddingRequest): Promise<EmbeddingResponse> {
    return this.post('/embeddings', body);
  }

  // ── Images ────────────────────────────────────────────────────────────────

  /**
   * POST /images/generations
   * Generates images from a prompt.
   */
  generateImage(body: ImageGenerateRequest): Promise<ImageResponse> {
    return this.post('/images/generations', body);
  }

  // ── Moderations ───────────────────────────────────────────────────────────

  /**
   * POST /moderations
   * Classifies if text is potentially harmful.
   */
  createModeration(body: ModerationRequest): Promise<ModerationResponse> {
    return this.post('/moderations', body);
  }
}
