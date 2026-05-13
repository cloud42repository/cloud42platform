# chatgpt.dto.ts

TypeScript interface definitions (DTOs) that mirror the OpenAI API request/response structures. Covers models, chat completions (including tool/function calling), embeddings, images, moderations, and audio (TTS & transcription).

## Key Exports

- **`ChatGPTUsage`** — Token usage summary (prompt, completion, total)
- **`ChatGPTModel` / `ChatGPTModelListResponse`** — Model metadata
- **`ChatMessage`** — A single message in a chat conversation (system/user/assistant/tool roles)
- **`ChatToolCall` / `ChatToolDefinition`** — Tool/function calling structures
- **`ChatCompletionRequest` / `ChatCompletionResponse` / `ChatCompletionChoice`** — Chat completion request and response shapes
- **`EmbeddingRequest` / `EmbeddingData` / `EmbeddingResponse`** — Embedding creation DTOs
- **`ImageGenerateRequest` / `ImageData` / `ImageResponse`** — Image generation DTOs
- **`ModerationRequest` / `ModerationCategoryScores` / `ModerationResult` / `ModerationResponse`** — Content moderation DTOs
- **`TTSRequest`** — Text-to-speech request
- **`TranscriptionRequest` / `TranscriptionResponse`** — Audio transcription DTOs

## Dependencies

None (pure type definitions).

## How It Works

Each interface group corresponds to an OpenAI API endpoint. Request interfaces define the body sent to the API; response interfaces define the expected return shape. These are used throughout the chatgpt module for type safety.
