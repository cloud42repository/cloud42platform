# nlu-engine.ts

A client-side Natural Language Understanding engine that classifies user text input into intents (navigate, search, create_workflow, ask_chatgpt, etc.) and extracts entities (modules, pages, search terms). Used to power a conversational command interface.

## Key Exports

- **`Intent`** — Union type of supported intents: `'navigate' | 'create_workflow' | 'search' | 'ask_chatgpt' | 'help' | 'list_modules' | 'greet' | 'farewell' | 'status' | 'unknown'`.
- **`NluEntity`** — Interface for extracted entities (type, value, canonical form, confidence).
- **`NluResult`** — Interface for classification output (intent, confidence, entities, optional route).
- **`NluEngine`** — Injectable service with a `classify(input)` method.

## Dependencies

- `@angular/core` — `Injectable`
- `../config/endpoints` — `MODULES`

## How It Works

1. **Tokenization** — Input is lowercased, punctuation-stripped, and split into tokens. A lightweight suffix-based stemmer normalizes words.
2. **Synonym expansion** — Tokens are expanded using a predefined synonym map (e.g., "goto" → "navigate", "gpt" → "chatgpt").
3. **TF-IDF scoring** — Expanded tokens (including bigrams) are compared against training samples using cosine similarity with IDF weighting.
4. **Signal boosters** — Regex-based pattern detectors and exact-match rules add score bonuses for high-confidence patterns.
5. **Entity extraction** — Module names are matched (including fuzzy Levenshtein matching), page keywords are detected, and intent-specific entities (search terms, freetext) are extracted.
6. **Navigation resolution** — If the top intent is "navigate", a nav-target scoring system resolves the best matching route from known targets.
7. **Context history** — Recent intents receive a small score bonus to support conversational continuity.
