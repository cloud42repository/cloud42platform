import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { environment } from '../../../environments/environment';

// Minimal typings for Google Identity Services
interface GisCredentialResponse {
  credential: string;
}

interface GoogleGsi {
  accounts: {
    id: {
      initialize(config: object): void;
      renderButton(el: HTMLElement, conf: object): void;
      prompt(): void;
    };
  };
}

declare global {
  interface Window { google?: GoogleGsi; }
  // eslint-disable-next-line no-var
  var google: GoogleGsi | undefined;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-bg">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-logo">☁️</div>
          <h1 class="login-title">Cloud42 Platform</h1>
          <p class="login-subtitle">API Administration Console</p>
        </div>

        <div class="login-divider"></div>

        <!-- ── Tab toggle ── -->
        <div class="tab-row">
          <button class="tab-btn" [class.active]="mode === 'login'" (click)="mode = 'login'; clearErrors()">Sign In</button>
          <button class="tab-btn" [class.active]="mode === 'register'" (click)="mode = 'register'; clearErrors()">Register</button>
        </div>

        <!-- ── Sign In mode ── -->
        @if (mode === 'login') {
          <div class="login-body">
            @if (isMockMode) {
              <button class="dev-login-btn" (click)="handleDevLogin()">🧪 Dev Login (Mock Mode)</button>
            } @else {
              <div class="google-btn-wrap" #googleBtn></div>
            }

            <div class="login-divider-text"><span>or sign in with password</span></div>

            <form class="pw-form" (ngSubmit)="handlePasswordLogin()">
              <input class="pw-input" type="email" placeholder="Email" [(ngModel)]="loginEmail" name="loginEmail" required autocomplete="email" />
              <input class="pw-input" type="password" placeholder="Password" [(ngModel)]="loginPassword" name="loginPassword" required autocomplete="current-password" />
              <button class="pw-btn" type="submit" [disabled]="!loginEmail || !loginPassword || busy">
                {{ busy ? 'Signing in…' : 'Sign In' }}
              </button>
            </form>

            @if (scriptError) {
              <p class="login-error">⚠️ Could not load Google sign-in. Check your internet connection.</p>
            }
            @if (loginError) {
              <p class="login-error">⚠️ {{ loginErrorMessage }}</p>
            }
          </div>
        }

        <!-- ── Register mode ── -->
        @if (mode === 'register') {
          <div class="login-body">
            @if (registerSuccess) {
              <div class="success-box">
                <span class="success-icon">✅</span>
                <p>Registration submitted! Please wait for an admin to approve your account. You will receive an email to set your password.</p>
              </div>
            } @else {
              <p class="login-prompt">Create a new account</p>
              <form class="pw-form" (ngSubmit)="handleRegister()">
                <input class="pw-input" type="text" placeholder="Full Name" [(ngModel)]="regName" name="regName" required autocomplete="name" />
                <input class="pw-input" type="email" placeholder="Email" [(ngModel)]="regEmail" name="regEmail" required autocomplete="email" />
                <button class="pw-btn" type="submit" [disabled]="!regName || !regEmail || busy">
                  {{ busy ? 'Registering…' : 'Register' }}
                </button>
              </form>
            }
            @if (loginError) {
              <p class="login-error">⚠️ {{ loginErrorMessage }}</p>
            }
          </div>
        }

        <p class="login-footer">Access is restricted to authorised accounts only.</p>
      </div>
    </div>
  `,
  styles: [`
    .login-bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%);
      padding: 24px;
    }
    .login-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(2, 132, 199, 0.25), 0 4px 16px rgba(0,0,0,.12);
      padding: 48px 40px 36px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      animation: fadeUp .4s ease;
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .login-logo {
      font-size: 52px;
      line-height: 1;
      margin-bottom: 12px;
      filter: drop-shadow(0 2px 8px rgba(2,132,199,.3));
    }
    .login-title {
      margin: 0 0 6px;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0c4a6e;
      letter-spacing: -0.5px;
    }
    .login-subtitle {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: 500;
    }
    .login-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #bae6fd, transparent);
      margin: 28px 0;
    }

    /* ── Tabs ── */
    .tab-row {
      display: flex;
      gap: 0;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .tab-btn {
      flex: 1;
      padding: 10px 0;
      border: none;
      background: #f8fafc;
      color: #64748b;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all .2s;
    }
    .tab-btn.active {
      background: #0284c7;
      color: #fff;
    }
    .tab-btn:hover:not(.active) {
      background: #e2e8f0;
    }

    .login-body { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .login-prompt {
      margin: 0;
      font-size: 0.95rem;
      color: #475569;
    }
    .google-btn-wrap {
      display: flex;
      justify-content: center;
      margin: 4px 0;
      min-height: 44px;
    }

    /* ── Divider with text ── */
    .login-divider-text {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #94a3b8;
      font-size: 0.8rem;
    }
    .login-divider-text::before,
    .login-divider-text::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    /* ── Form ── */
    .pw-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .pw-input {
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color .2s;
      color: #1e293b;
    }
    .pw-input:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2,132,199,.12);
    }
    .pw-btn {
      padding: 12px 28px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform .15s, box-shadow .15s;
      box-shadow: 0 2px 8px rgba(3,105,161,.3);
    }
    .pw-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(3,105,161,.4);
    }
    .pw-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .dev-login-btn {
      padding: 12px 28px;
      font-size: 0.95rem;
      font-weight: 600;
      color: #fff;
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: transform .15s, box-shadow .15s;
      box-shadow: 0 2px 8px rgba(3,105,161,.3);
    }
    .dev-login-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(3,105,161,.4);
    }
    .login-error {
      font-size: 0.8rem;
      color: #dc2626;
      margin: 0;
    }
    .login-footer {
      margin: 28px 0 0;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* ── Success box ── */
    .success-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    .success-icon { font-size: 2rem; }
    .success-box p {
      margin: 10px 0 0;
      color: #166534;
      font-size: 0.9rem;
      line-height: 1.5;
    }
  `],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef?: ElementRef<HTMLDivElement>;

  scriptError = false;
  loginError = false;
  loginErrorMessage = 'Login failed. Please try again.';
  isMockMode = environment.mockMode ?? false;
  busy = false;

  mode: 'login' | 'register' = 'login';
  registerSuccess = false;

  /* Password login fields */
  loginEmail = '';
  loginPassword = '';

  /* Registration fields */
  regName = '';
  regEmail = '';

  constructor(
    private readonly authService: AuthService,
    private readonly userApi: UserApiService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectAfterLogin();
    }
  }

  ngAfterViewInit(): void {
    if (this.isMockMode) return;
    this.loadGoogleScript()
      .then(() => this.renderGoogleButton())
      .catch(() => { this.scriptError = true; });
  }

  clearErrors(): void {
    this.loginError = false;
    this.loginErrorMessage = '';
  }

  /* ── Password Login ── */

  async handlePasswordLogin(): Promise<void> {
    if (!this.loginEmail || !this.loginPassword) return;
    this.busy = true;
    this.clearErrors();
    try {
      await this.authService.loginWithPassword(this.loginEmail, this.loginPassword);
      this.redirectAfterLogin();
    } catch (err: any) {
      this.loginErrorMessage = err?.error?.message || err?.message || 'Login failed. Please try again.';
      this.loginError = true;
    } finally {
      this.busy = false;
    }
  }

  /* ── Registration ── */

  async handleRegister(): Promise<void> {
    if (!this.regName || !this.regEmail) return;
    this.busy = true;
    this.clearErrors();
    try {
      await firstValueFrom(this.userApi.register(this.regEmail, this.regName));
      this.registerSuccess = true;
    } catch (err: any) {
      this.loginErrorMessage = err?.error?.message || err?.message || 'Registration failed.';
      this.loginError = true;
    } finally {
      this.busy = false;
    }
  }

  async handleDevLogin(): Promise<void> {
    try {
      this.loginError = false;
      await this.authService.devLogin();
      this.redirectAfterLogin();
    } catch (err) {
      console.error('Dev login failed', err);
      this.loginErrorMessage = (err as any)?.error?.message
        || (err as any)?.message
        || 'Dev login failed. Is the backend running in MOCK_MODE?';
      this.loginError = true;
    }
  }

  private redirectAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl && returnUrl !== '/' ? returnUrl : '/dashboards');
  }

  private loadGoogleScript(): Promise<void> {
    if (globalThis.google?.accounts) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google GSI script'));
      document.head.appendChild(script);
    });
  }

  private renderGoogleButton(): void {
    const gis = globalThis.google?.accounts?.id;
    if (!gis || !this.googleBtnRef) return;

    gis.initialize({
      client_id: environment.googleClientId,
      callback: async (response: GisCredentialResponse) => {
        try {
          this.loginError = false;
          // Send raw Google ID token to backend for server-side verification
          await this.authService.loginWithGoogle(response.credential);
          this.redirectAfterLogin();
        } catch (err: any) {
          console.error('Login failed', err);
          this.loginErrorMessage = err?.error?.message
            || err?.message
            || `Login failed (${err?.status ?? 'unknown'}). Please try again.`;
          this.loginError = true;
        }
      },
    });

    gis.renderButton(this.googleBtnRef.nativeElement, {
      theme: 'outline',
      size: 'large',
      width: 280,
      text: 'signin_with',
      shape: 'rectangular',
    });
  }
}
