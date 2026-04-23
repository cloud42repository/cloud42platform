import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY', '');
    this.fromEmail = this.config.get<string>('SENDGRID_FROM_EMAIL', 'noreply@cloud42.dev');
    this.frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:4200');
    this.enabled = !!apiKey;

    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid configured');
    } else {
      this.logger.warn('SENDGRID_API_KEY not set — emails will be logged to console only');
    }
  }

  getFrontendUrl(): string {
    return this.frontendUrl;
  }

  /**
   * Send the "Set your password" email after admin approval.
   */
  async sendPasswordSetEmail(
    toEmail: string,
    userName: string,
    token: string,
  ): Promise<void> {
    const link = `${this.frontendUrl}/set-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(toEmail)}`;

    const subject = 'Cloud42 — Your account has been approved';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
        <div style="background: linear-gradient(135deg, #0c4a6e, #0284c7); border-radius: 12px 12px 0 0; padding: 32px 28px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">☁️ Cloud42 Platform</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 28px;">
          <p style="color: #1e293b; font-size: 16px; margin: 0 0 16px;">Hello <strong>${this.escapeHtml(userName)}</strong>,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Your Cloud42 account has been approved by an administrator.
            Please click the button below to set your password and activate your account.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${link}"
               style="display: inline-block; padding: 12px 32px; background: #0284c7; color: #fff;
                      text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Set My Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 0; line-height: 1.5;">
            This link will expire in 48 hours. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </div>
    `;

    if (!this.enabled) {
      this.logger.log(`[EMAIL MOCK] To: ${toEmail} | Subject: ${subject}`);
      this.logger.log(`[EMAIL MOCK] Set password link: ${link}`);
      return;
    }

    try {
      await sgMail.send({
        to: toEmail,
        from: this.fromEmail,
        subject,
        html,
      });
      this.logger.log(`Password-set email sent to ${toEmail}`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${toEmail}`, (err as Error).message);
      throw err;
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
