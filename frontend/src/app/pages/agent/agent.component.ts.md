# agent.component.ts

This component implements an AI-powered conversational agent interface for the Cloud42 Platform. It supports natural language navigation, workflow creation from prompts, global search across API data, and multi-turn ChatGPT conversations. It uses a custom NLU (Natural Language Understanding) engine to classify user intents.

## Key Exports

- **`AgentComponent`** — Standalone Angular component for the AI agent chat UI (selector: `app-agent`)
- **`AgentMessage`** — Interface for chat messages (role, html content, actions, timestamp, source)
- **`ChatGPTMsg`** — Interface for ChatGPT conversation history entries

## Template

The template (in `agent.component.html`) features:
- Chat message area with agent and user messages
- Input bar with send button
- ChatGPT mode toggle (slide toggle)
- Clear chat button
- Action buttons within messages for quick navigation

## Dependencies

- `@angular/material` — Card, FormField, Input, Button, Icon, Divider, Tooltip, ProgressSpinner, SlideToggle
- `ApiService` — Backend API calls for global search and ChatGPT
- `WorkflowService` — Creates and persists auto-generated workflows
- `MODULES` / `extractPathParams` — Module definitions for navigation and workflow building
- `NluEngine` — Custom NLU service for intent classification and entity extraction
- `Router` — Angular router for programmatic navigation

## How It Works

When the user sends a message, the NLU engine classifies the intent (navigate, create_workflow, search, ask_chatgpt, help, greet, etc.). For navigation, it matches against a keyword-based NAV_MAP and MODULES list, then auto-navigates. For workflow creation, it scans all module endpoints matching the user's description, deduplicates, builds a `Workflow` object, saves it, and navigates to the editor. In ChatGPT mode, all messages are forwarded to the backend ChatGPT endpoint with full conversation history for multi-turn dialogue. Low-confidence inputs fall through to a one-shot ChatGPT query.
