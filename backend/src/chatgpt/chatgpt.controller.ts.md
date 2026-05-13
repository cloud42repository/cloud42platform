# chatgpt.controller.ts

NestJS REST controller that exposes OpenAI/ChatGPT API endpoints under the `/chatgpt` route prefix. It delegates all business logic to `ChatGPTService` and provides endpoints for models, chat completions, embeddings, image generation, and content moderation.

## Key Exports

- **`ChatGPTController`** — NestJS controller with routes for interacting with the OpenAI API.

## Dependencies

- `@nestjs/common` — Controller, Get, Post, Param, Body decorators
- `./chatgpt.service` — ChatGPTService
- `./chatgpt.dto` — ChatCompletionRequest, EmbeddingRequest, ImageGenerateRequest, ModerationRequest

## How It Works

The controller defines five route handlers:
1. `GET /chatgpt/models` — lists all available OpenAI models
2. `GET /chatgpt/models/:modelId` — retrieves a specific model
3. `POST /chatgpt/chat/completions` — creates a chat completion from a message array
4. `POST /chatgpt/embeddings` — generates embedding vectors
5. `POST /chatgpt/images/generations` — generates images from a prompt
6. `POST /chatgpt/moderations` — classifies text for harmful content

Each handler passes the request body or params directly to the corresponding service method.
