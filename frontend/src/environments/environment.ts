export const environment = {
  production: false,
  mockMode: false,          // set to false to use real Google login in dev
  apiBase: 'http://localhost:3000/api',
  // ⚠️  Replace with your real Google OAuth Client ID from https://console.cloud.google.com/
  googleClientId: '293033288145-egi954spbnkgmp4a6htnkhhhnc0lds6b.apps.googleusercontent.com',
  // ⚠️  Replace with your real Microsoft (Azure AD) Application (client) ID
  microsoftClientId: '17b78aab-95eb-456f-b71f-c80f9c20e196',
  microsoftTenantId: '17bc7597-d925-4aba-ae8e-a92604069611',
};
