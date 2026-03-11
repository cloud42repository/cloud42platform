// ─── OpenAI / ChatGPT API DTOs ────────────────────────────────────────────────
// Based on https://platform.openai.com/docs/api-reference

// ─── Common ───────────────────────────────────────────────────────────────────

export interface ChatGPTUsage {
  prompt_tokens: number;
  completion_tokens?: number;
  total_tokens: number;
}

// ─── Models ───────────────────────────────────────────────────────────────────

export interface ChatGPTModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ChatGPTModelListResponse {
  object: string;
  data: ChatGPTModel[];
}

// ─── Chat Completions ─────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: ChatToolCall[];
  tool_call_id?: string;
}

export interface ChatToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatToolDefinition {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  user?: string;
  tools?: ChatToolDefinition[];
  tool_choice?: 'none' | 'auto' | { type: 'function'; function: { name: string } };
  response_format?: { type: 'text' | 'json_object' };
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: ChatGPTUsage;
  system_fingerprint?: string;
}

// ─── Embeddings ───────────────────────────────────────────────────────────────

export interface EmbeddingRequest {
  model: string;
  input: string | string[];
  encoding_format?: 'float' | 'base64';
  dimensions?: number;
  user?: string;
}

export interface EmbeddingData {
  object: string;
  index: number;
  embedding: number[];
}

export interface EmbeddingResponse {
  object: string;
  data: EmbeddingData[];
  model: string;
  usage: ChatGPTUsage;
}

// ─── Images ───────────────────────────────────────────────────────────────────

export interface ImageGenerateRequest {
  model?: string;
  prompt: string;
  n?: number;
  quality?: 'standard' | 'hd';
  response_format?: 'url' | 'b64_json';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  user?: string;
}

export interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

export interface ImageResponse {
  created: number;
  data: ImageData[];
}

// ─── Moderations ──────────────────────────────────────────────────────────────

export interface ModerationRequest {
  model?: string;
  input: string | string[];
}

export interface ModerationCategoryScores {
  hate: number;
  'hate/threatening': number;
  harassment: number;
  'harassment/threatening': number;
  'self-harm': number;
  'self-harm/intent': number;
  'self-harm/instructions': number;
  sexual: number;
  'sexual/minors': number;
  violence: number;
  'violence/graphic': number;
}

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  category_scores: ModerationCategoryScores;
}

export interface ModerationResponse {
  id: string;
  model: string;
  results: ModerationResult[];
}

// ─── Audio (TTS & Transcription) ──────────────────────────────────────────────

export interface TTSRequest {
  model: string;
  input: string;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  response_format?: 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';
  speed?: number;
}

export interface TranscriptionRequest {
  model: string;
  /** Path to the audio file (handled via multipart on real calls) */
  file: string;
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

export interface TranscriptionResponse {
  text: string;
}
