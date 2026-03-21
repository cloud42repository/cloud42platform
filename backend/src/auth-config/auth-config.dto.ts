/** Matches the frontend AuthConfig shape. */
export interface AuthConfigDto {
  type: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  scope?: string;
  authorizationUrl?: string;
  redirectUri?: string;
  code?: string;
  organizationId?: string;
  refreshToken?: string;
  deviceAuthorizationUrl?: string;
  apiKeyHeader?: string;
  apiKeyValue?: string;
  username?: string;
  password?: string;
  bearerToken?: string;
  // Token data stored after Zoho code exchange
  accessToken?: string;
  tokenExpiresAt?: string;      // ISO 8601
  accountsUrl?: string;
}

/** Body of PUT /api/auth-configs/:moduleId */
export interface SaveAuthConfigDto {
  config: AuthConfigDto;
}

/** Response shape returned by the API */
export interface AuthConfigResponseDto {
  moduleId: string;
  config: AuthConfigDto;
  updatedAt: string;
}
