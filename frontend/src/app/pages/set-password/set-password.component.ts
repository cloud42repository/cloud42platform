import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UserApiService } from '../../services/user-api.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="sp-bg">
      <div class="sp-card">
        <div class="sp-brand">
          <div class="sp-logo">☁️</div>
          <h1 class="sp-title">Cloud42 Platform</h1>
          <p class="sp-subtitle">Set Your Password</p>
        </div>

        <div class="sp-divider"></div>

        @if (done) {
          <div class="success-box">
            <span class="success-icon">✅</span>
            <p>Your password has been set successfully!</p>
            <button class="sp-btn" (click)="goToLogin()">Go to Sign In</button>
          </div>
        } @else if (missingParams) {
          <div class="error-box">
            <p>Invalid or missing link parameters. Please use the link from your email.</p>
          </div>
        } @else {
          <form class="sp-form" (ngSubmit)="submit()">
            <p class="sp-prompt">Create a password for <strong>{{ email }}</strong></p>
            <input class="sp-input" type="password" placeholder="New Password (min 8 chars)"
                   [(ngModel)]="password" name="password" required minlength="8"
                   autocomplete="new-password" />
            <input class="sp-input" type="password" placeholder="Confirm Password"
                   [(ngModel)]="confirmPassword" name="confirmPassword" required
                   autocomplete="new-password" />
            @if (password && confirmPassword && password !== confirmPassword) {
              <p class="sp-error">Passwords do not match.</p>
            }
            @if (error) {
              <p class="sp-error">⚠️ {{ errorMessage }}</p>
            }
            <button class="sp-btn" type="submit"
                    [disabled]="!password || password.length < 8 || password !== confirmPassword || busy">
              {{ busy ? 'Setting password…' : 'Set Password' }}
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .sp-bg {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%);
      padding: 24px;
    }
    .sp-card {
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
    .sp-logo { font-size: 52px; line-height: 1; margin-bottom: 12px; }
    .sp-title {
      margin: 0 0 6px;
      font-size: 1.6rem;
      font-weight: 700;
      color: #0c4a6e;
    }
    .sp-subtitle {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 500;
    }
    .sp-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #bae6fd, transparent);
      margin: 28px 0;
    }
    .sp-prompt {
      margin: 0 0 8px;
      font-size: 0.9rem;
      color: #475569;
    }
    .sp-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sp-input {
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color .2s;
      color: #1e293b;
    }
    .sp-input:focus {
      border-color: #0284c7;
      box-shadow: 0 0 0 3px rgba(2,132,199,.12);
    }
    .sp-btn {
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
      margin-top: 4px;
    }
    .sp-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(3,105,161,.4);
    }
    .sp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .sp-error { font-size: 0.8rem; color: #dc2626; margin: 0; }
    .success-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 10px;
      padding: 20px;
    }
    .success-icon { font-size: 2rem; }
    .success-box p { margin: 10px 0 16px; color: #166534; font-size: 0.9rem; }
    .error-box {
      background: #fef2f2;
      border: 1px solid #fca5a5;
      border-radius: 10px;
      padding: 20px;
      color: #991b1b;
      font-size: 0.9rem;
    }
  `],
})
export class SetPasswordComponent implements OnInit {
  email = '';
  token = '';
  password = '';
  confirmPassword = '';
  busy = false;
  done = false;
  error = false;
  errorMessage = '';
  missingParams = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userApi: UserApiService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get('email') ?? '';
    this.token = params.get('token') ?? '';
    if (!this.email || !this.token) {
      this.missingParams = true;
    }
  }

  async submit(): Promise<void> {
    if (!this.password || this.password.length < 8 || this.password !== this.confirmPassword) return;
    this.busy = true;
    this.error = false;
    try {
      await firstValueFrom(this.userApi.setPassword(this.email, this.token, this.password));
      this.done = true;
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Failed to set password.';
      this.error = true;
    } finally {
      this.busy = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
