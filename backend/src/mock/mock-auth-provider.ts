import { IAuthProvider } from '../auth/IAuthProvider';

/**
 * Auth provider used in MOCK_MODE.
 * Returns a static fake token so no real OAuth handshake is attempted.
 */
export class MockAuthProvider implements IAuthProvider {
  getAccessToken(): Promise<string> {
    return Promise.resolve('mock-access-token-local');
  }

  invalidate(): void {
    // no-op — nothing to invalidate in mock mode
  }
}
