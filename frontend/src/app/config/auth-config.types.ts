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
  code?: string;
  organizationId?: string;
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
  // Stored token data (set by backend after code exchange)
  accessToken?: string;
  tokenExpiresAt?: string;  // ISO date
  accountsUrl?: string;
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

// ─── Service-specific config interfaces ────────────────────────────────────────

/** Zoho OAuth config — shared by all 20 Zoho modules */
export interface ZohoProductConfig {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  accountsUrl?: string;
  apiBaseUrl?: string;
  redirectUri?: string;
  code?: string;
  organizationId?: string;
  // Token data stored by backend
  accessToken?: string;
  tokenExpiresAt?: string;
}

/** ChatGPT / OpenAI config */
export interface ChatGPTClientConfig {
  apiKey: string;
  orgId?: string;
  baseUrl?: string;
  timeout?: number;
}

/** Impossible Cloud config */
export interface ImpossibleCloudConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

/** Softvalue API config */
export interface SoftvalueClientConfig {
  token: string;
  baseUrl?: string;
  timeout?: number;
}

// ─── Service config groups (for the settings UI) ───────────────────────────────

export type ServiceConfigKind = 'zoho' | 'chatgpt' | 'impossible-cloud' | 'softvalue';

export interface ServiceConfigField {
  key: string;
  label: string;
  placeholder?: string;
  secret?: boolean;
  type?: 'text' | 'number';
}

export interface ServiceConfigGroup {
  kind: ServiceConfigKind;
  /** Unique ID used as the moduleId when persisting via AuthConfigService */
  configId: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  /** Module IDs this config covers */
  moduleIds: string[];
  fields: ServiceConfigField[];
}

export const SERVICE_CONFIG_GROUPS: ServiceConfigGroup[] = [
  {
    kind: 'zoho',
    configId: '__zoho__',
    label: 'Zoho',
    icon: 'cloud',
    color: '#dc2626',
    description: 'OAuth credentials shared by all Zoho modules (CRM, Books, Desk, …)',
    moduleIds: [
      'zoho-analytics', 'zoho-books', 'zoho-campaigns', 'zoho-cliq', 'zoho-commerce',
      'zoho-creator', 'zoho-crm', 'zoho-desk', 'zoho-expense', 'zoho-inventory',
      'zoho-invoice', 'zoho-mail', 'zoho-payroll', 'zoho-people', 'zoho-projects',
      'zoho-recruit', 'zoho-salesiq', 'zoho-sign', 'zoho-subscriptions', 'zoho-workdrive',
    ],
    fields: [
      { key: 'clientId',       label: 'Client ID',        placeholder: 'e.g. 1000.ABC123…' },
      { key: 'clientSecret',   label: 'Client Secret',    placeholder: '••••••••', secret: true },
      { key: 'redirectUri',    label: 'Redirect URI',     placeholder: 'https://yourapp.com/oauth/callback' },
      { key: 'code',           label: 'Grant Code',       placeholder: 'Paste the authorization code from Zoho' },
      { key: 'organizationId', label: 'Organization ID',  placeholder: 'e.g. 12345678' },
      { key: 'accountsUrl',    label: 'Accounts URL',     placeholder: 'https://accounts.zoho.eu' },
      { key: 'scope',          label: 'Scope',            placeholder: 'ZohoCRM.modules.ALL ZohoBooks.fullaccess.all' },
    ],
  },
  {
    kind: 'chatgpt',
    configId: '__chatgpt__',
    label: 'ChatGPT / OpenAI',
    icon: 'smart_toy',
    color: '#10a37f',
    description: 'API key and settings for OpenAI ChatGPT integration',
    moduleIds: ['chatgpt'],
    fields: [
      { key: 'apiKey',   label: 'API Key',          placeholder: 'sk-…', secret: true },
      { key: 'orgId',    label: 'Organization ID',  placeholder: 'org-…' },
      { key: 'baseUrl',  label: 'Base URL',         placeholder: 'https://api.openai.com/v1' },
      { key: 'timeout',  label: 'Timeout (ms)',     placeholder: '60000', type: 'number' },
    ],
  },
  {
    kind: 'impossible-cloud',
    configId: '__impossible-cloud__',
    label: 'Impossible Cloud',
    icon: 'cloud_queue',
    color: '#7c3aed',
    description: 'API key and settings for Impossible Cloud partner API',
    moduleIds: ['impossible-cloud'],
    fields: [
      { key: 'apiKey',   label: 'API Key',      placeholder: '••••••••', secret: true },
      { key: 'baseUrl',  label: 'Base URL',     placeholder: 'https://api.partner.impossiblecloud.com/v1' },
      { key: 'timeout',  label: 'Timeout (ms)', placeholder: '30000', type: 'number' },
    ],
  },
  {
    kind: 'softvalue',
    configId: '__softvalue__',
    label: 'Softvalue',
    icon: 'token',
    color: '#0284c7',
    description: 'Bearer token and settings for the Softvalue API',
    moduleIds: ['softvalue'],
    fields: [
      { key: 'token',    label: 'Bearer Token', placeholder: '••••••••', secret: true },
      { key: 'baseUrl',  label: 'Base URL',     placeholder: 'https://api.softvalue.com/v1' },
      { key: 'timeout',  label: 'Timeout (ms)', placeholder: '30000', type: 'number' },
    ],
  },
];
