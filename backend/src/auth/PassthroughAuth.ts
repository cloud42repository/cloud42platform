import { IAuthProvider } from "./IAuthProvider";

/**
 * Auth strategy: Pre-supplied access credential (pass-through)
 *
 * Use when an external system (secrets manager, parent app, CI environment)
 * already handles OAuth and supplies a ready-to-use Zoho access value.
 * This adapter simply forwards that value to every request.
 *
 * Call update(newValue) whenever your upstream system rotates credentials.
 * If an automatic 401 retry is needed, override invalidate() to trigger
 * a fetch from your upstream store.
 */
export class PassthroughAuth implements IAuthProvider {
  constructor(private accessValue: string) {}

  /** Replace the forwarded credential, e.g. after a rotation. */
  update(newValue: string): void {
    this.accessValue = newValue;
  }

  /**
   * No-op by default: the upstream system owns the lifecycle.
   * Override or call update() externally to respond to 401s.
   */
  invalidate(): void {}

  async getAccessToken(): Promise<string> {
    return this.accessValue;
  }
}
