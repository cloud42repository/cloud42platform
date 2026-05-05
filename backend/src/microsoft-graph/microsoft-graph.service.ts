import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthConfigService } from '../auth-config/auth-config.service';
import { getCurrentUserEmail } from '../auth-module/user-context';
import axios from 'axios';
import type { SendMailRequest, SendMailResponse } from './microsoft-graph.dto';

interface GraphTokenCache {
  accessToken: string;
  expiresAt: number;
}

@Injectable()
export class MicrosoftGraphService {
  private readonly logger = new Logger(MicrosoftGraphService.name);
  private readonly tokenCache = new Map<string, GraphTokenCache>();

  constructor(
    private readonly config: ConfigService,
    private readonly authConfigService: AuthConfigService,
  ) {}

  private async getAccessToken(email: string): Promise<string> {
    // Check cache
    const cached = this.tokenCache.get(email);
    if (cached && cached.expiresAt > Date.now() + 60_000) {
      return cached.accessToken;
    }

    // Load config from auth_configs table
    const row = await this.authConfigService.findOne(email, '__microsoft-graph__');
    if (!row?.config) {
      throw new Error('Microsoft Graph not configured. Please add your credentials in Settings.');
    }

    const c = row.config as Record<string, unknown>;
    const clientId = (c['clientId'] as string) || this.config.get('MS_GRAPH_CLIENT_ID', '');
    const clientSecret = (c['clientSecret'] as string) || this.config.get('MS_GRAPH_CLIENT_SECRET', '');
    const tenantId = (c['tenantId'] as string) || this.config.get('MS_GRAPH_TENANT_ID', 'common');
    const refreshToken = c['refreshToken'] as string;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Microsoft Graph credentials incomplete (clientId, clientSecret, refreshToken required).');
    }

    // Exchange refresh token for access token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    });

    const res = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const accessToken = res.data.access_token;
    const expiresIn = res.data.expires_in ?? 3600;

    // Update refresh token if a new one was issued
    if (res.data.refresh_token && res.data.refresh_token !== refreshToken) {
      await this.authConfigService.save(email, '__microsoft-graph__', {
        ...c,
        refreshToken: res.data.refresh_token,
      });
    }

    this.tokenCache.set(email, {
      accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    return accessToken;
  }

  async sendMail(req: SendMailRequest): Promise<SendMailResponse> {
    const email = getCurrentUserEmail();
    if (!email) throw new Error('No authenticated user');

    const accessToken = await this.getAccessToken(email);

    const toRecipients = (Array.isArray(req.to) ? req.to : [req.to])
      .map(addr => ({ emailAddress: { address: addr } }));

    const ccRecipients = req.cc
      ? (Array.isArray(req.cc) ? req.cc : [req.cc]).map(addr => ({ emailAddress: { address: addr } }))
      : undefined;

    const bccRecipients = req.bcc
      ? (Array.isArray(req.bcc) ? req.bcc : [req.bcc]).map(addr => ({ emailAddress: { address: addr } }))
      : undefined;

    const message: Record<string, unknown> = {
      subject: req.subject,
      body: {
        contentType: req.contentType === 'html' ? 'HTML' : 'Text',
        content: req.body,
      },
      toRecipients,
    };

    if (ccRecipients) message['ccRecipients'] = ccRecipients;
    if (bccRecipients) message['bccRecipients'] = bccRecipients;

    if (req.attachments?.length) {
      message['attachments'] = req.attachments.map(a => ({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: a.name,
        contentType: a.contentType,
        contentBytes: a.contentBytes,
      }));
    }

    await axios.post(
      'https://graph.microsoft.com/v1.0/me/sendMail',
      {
        message,
        saveToSentItems: req.saveToSentItems !== false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`Email sent to ${req.to} by ${email}`);
    return { success: true, message: `Email sent to ${Array.isArray(req.to) ? req.to.join(', ') : req.to}` };
  }
}
