# chatgpt.controller.e2e-spec.ts

End-to-end tests for the `ChatGPTController`, exercising OpenAI API proxy endpoints including model listing, chat completions, embeddings, image generation, and content moderation.

## Test Suites

- **ChatGPTController (e2e)** — Tests all ChatGPT/OpenAI proxy endpoints with the full AppModule.

## Key Test Cases

- `GET /chatgpt/models → listModels()` — Lists available AI models.
- `GET /chatgpt/models/:modelId → getModel()` — Retrieves details for a specific model (gpt-4).
- `POST /chatgpt/chat/completions → createChatCompletion()` — Sends a chat completion request.
- `POST /chatgpt/embeddings → createEmbedding()` — Creates text embeddings.
- `POST /chatgpt/images/generations → generateImage()` — Generates an image from a prompt.
- `POST /chatgpt/moderations → createModeration()` — Runs content moderation on input text.

## Test Setup

- Uses `Test.createTestingModule` importing the full `AppModule`.
- No mocks beyond the module compilation — relies on service-level mocking or live integration.
- Module fixture is closed in `afterAll`.
