import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

// Minimal typings for Google Identity Services
interface GisCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: object): void;
          renderButton(el: HTMLElement, conf: object): void;
          prompt(): void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  template: `
    <div class="login-bg">
      <div class="login-card">
        <div class="login-brand">
          <div class="login-logo">☁️</div>
          <h1 class="login-title">Cloud42 Platform</h1>
          <p class="login-subtitle">API Administration Console</p>
        </div>

        <div class="login-divider"></div>

        <div class="login-body">
          <p class="login-prompt">Sign in to continue</p>
          @if (isMockMode) {
            <button class="dev-login-btn" (click)="handleDevLogin()">🧪 Dev Login (Mock Mode)</button>
          } @else {
            <div class="google-btn-wrap" #googleBtn></div>
          }
          @if (scriptError) {
            <p class="login-error">⚠️ Could not load Google sign-in. Check your internet connection.</p>
          }
          @if (loginError) {
            <p class="login-error">⚠️ {{ loginErrorMessage }}</p>
          }
        </div>

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
      max-width: 380px;
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
  `],
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef?: ElementRef<HTMLDivElement>;

  scriptError = false;
  loginError = false;
  loginErrorMessage = 'Login failed. Please try again.';
  isMockMode = environment.mockMode ?? false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboards']);
    }
  }

  ngAfterViewInit(): void {
    if (this.isMockMode) return;   // skip Google script in mock mode
    this.loadGoogleScript()
      .then(() => this.renderGoogleButton())
      .catch(() => { this.scriptError = true; });
  }

  async handleDevLogin(): Promise<void> {
    try {
      this.loginError = false;
      await this.authService.devLogin();
      this.router.navigate(['/dashboards']);
    } catch (err) {
      console.error('Dev login failed', err);
      this.loginErrorMessage = (err as any)?.error?.message
        || (err as any)?.message
        || 'Dev login failed. Is the backend running in MOCK_MODE?';
      this.loginError = true;
    }
  }

  private loadGoogleScript(): Promise<void> {
    if (window.google?.accounts) {
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
    const gis = window.google?.accounts?.id;
    if (!gis || !this.googleBtnRef) return;

    gis.initialize({
      client_id: environment.googleClientId,
      callback: async (response: GisCredentialResponse) => {
        try {
          this.loginError = false;
          // Send raw Google ID token to backend for server-side verification
          await this.authService.loginWithGoogle(response.credential);
          this.router.navigate(['/dashboards']);
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
