// ─── Core interface ───────────────────────────────────────────────────────────
export type { IAuthProvider, ZohoRawTokenResponse, CachedToken, ZohoDeviceCodeResponse } from "./IAuthProvider";

// ─── Providers ────────────────────────────────────────────────────────────────
export { OAuthRefreshProvider } from "./OAuthRefreshProvider";
export type { OAuthRefreshConfig } from "./OAuthRefreshProvider";
// Named aliases for discoverability
export { OAuthRefreshProvider as RefreshTokenAuth } from "./OAuthRefreshProvider";
export type { OAuthRefreshConfig as RefreshTokenAuthConfig } from "./OAuthRefreshProvider";

export { ClientCredentialsAuth } from "./ClientCredentialsAuth";
export type { ClientCredentialsConfig } from "./ClientCredentialsAuth";

export { AuthorizationCodeAuth } from "./AuthorizationCodeAuth";
export type { AuthCodeConfig, AuthCodeTokens } from "./AuthorizationCodeAuth";

export { PKCEAuth } from "./PKCEAuth";
export type { PKCEAuthConfig } from "./PKCEAuth";

export { DeviceFlowAuth } from "./DeviceFlowAuth";
export type { DeviceFlowConfig, DeviceFlowPromptFn } from "./DeviceFlowAuth";

export { PassthroughAuth } from "./PassthroughAuth";

export { CustomAuthProvider } from "./CustomAuthProvider";
export type { CustomAuthConfig, CustomTokenResult, CustomTokenFetcher } from "./CustomAuthProvider";
