# DeviceFlowAuth.spec.ts

Tests the `DeviceFlowAuth` class which implements the OAuth 2.0 Device Authorization Grant (device flow), covering the user prompt phase, polling for authorization, token caching, refresh, and invalidation.

## Test Suites

- **DeviceFlowAuth** — Top-level suite with nested describes for `startFlow()` and `getAccessToken()`.

## Key Test Cases

- `startFlow() calls onPrompt with device code info and resolves tokens` — Verifies the full flow from device code request through polling to token receipt.
- `startFlow() keeps polling on authorization_pending` — Confirms retry behavior when user hasn't yet authorized.
- `returns initial token without network call when still valid` — Tests cached token reuse.
- `silently re-refreshes when expired` — Validates automatic refresh using the refresh token.
- `throws when no tokens available and startFlow() not called` — Ensures proper error when uninitialized.
- `invalidate() forces re-fetch on next getAccessToken()` — Confirms invalidation clears cached token.

## Test Setup

- `axios` is mocked globally via `jest.mock("axios")`.
- `jest.useFakeTimers()` is used to control polling intervals.
- `beforeEach` clears all mocks; `afterAll` restores real timers.
- Mock responses simulate both the device code endpoint and the token polling endpoint.
