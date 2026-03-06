export type AuthType =
  | 'none'
  | 'client-credentials'
  | 'authorization-code'
  | 'pkce'
  | 'oauth-refresh'
  | 'device-flow'
  | 'api-key'
  | 'basic-auth';

export interface AuthConfig {
  type: AuthType;
  // OAuth / client credentials
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  scope?: string;
  // Authorization code / PKCE extras
  authorizationUrl?: string;
  redirectUri?: string;
  // OAuth Refresh
  refreshToken?: string;
  // Device flow
  deviceAuthorizationUrl?: string;
  // API key
  apiKeyHeader?: string;   // e.g. "X-API-Key"
  apiKeyValue?: string;
  // Basic auth
  username?: string;
  password?: string;
  // Bearer / static token
  bearerToken?: string;
}

export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  'none':               'No Authentication',
  'client-credentials': 'Client Credentials (OAuth 2.0)',
  'authorization-code': 'Authorization Code (OAuth 2.0)',
  'pkce':               'PKCE (OAuth 2.0)',
  'oauth-refresh':      'OAuth Refresh Token',
  'device-flow':        'Device Flow (OAuth 2.0)',
  'api-key':            'API Key',
  'basic-auth':         'Basic Auth (Username / Password)',
};

/** Fields required per auth type */
export const AUTH_TYPE_FIELDS: Record<AuthType, (keyof AuthConfig)[]> = {
  'none':               [],
  'client-credentials': ['clientId', 'clientSecret', 'tokenUrl', 'scope'],
  'authorization-code': ['clientId', 'clientSecret', 'authorizationUrl', 'tokenUrl', 'redirectUri', 'scope'],
  'pkce':               ['clientId', 'authorizationUrl', 'tokenUrl', 'redirectUri', 'scope'],
  'oauth-refresh':      ['clientId', 'clientSecret', 'refreshToken', 'tokenUrl', 'scope'],
  'device-flow':        ['clientId', 'deviceAuthorizationUrl', 'tokenUrl', 'scope'],
  'api-key':            ['apiKeyHeader', 'apiKeyValue'],
  'basic-auth':         ['username', 'password'],
};

export const AUTH_FIELD_LABELS: Record<string, { label: string; placeholder?: string; secret?: boolean }> = {
  clientId:               { label: 'Client ID',                placeholder: 'e.g. 1000.abc123…' },
  clientSecret:           { label: 'Client Secret',            placeholder: '••••••••',           secret: true },
  tokenUrl:               { label: 'Token URL',                placeholder: 'https://accounts.example.com/oauth/v2/token' },
  scope:                  { label: 'Scope',                    placeholder: 'ZohoCRM.modules.ALL' },
  authorizationUrl:       { label: 'Authorization URL',        placeholder: 'https://accounts.example.com/oauth/v2/auth' },
  redirectUri:            { label: 'Redirect URI',             placeholder: 'https://yourapp.com/callback' },
  refreshToken:           { label: 'Refresh Token',            placeholder: '••••••••',           secret: true },
  deviceAuthorizationUrl: { label: 'Device Auth URL',          placeholder: 'https://accounts.example.com/oauth/v2/device' },
  apiKeyHeader:           { label: 'Header Name',              placeholder: 'X-API-Key' },
  apiKeyValue:            { label: 'API Key Value',            placeholder: '••••••••',           secret: true },
  username:               { label: 'Username',                 placeholder: 'user@example.com' },
  password:               { label: 'Password',                 placeholder: '••••••••',           secret: true },
  bearerToken:            { label: 'Bearer Token',             placeholder: '••••••••',           secret: true },
};

export interface ModuleAuthSetting {
  moduleId: string;
  config: AuthConfig;
}
