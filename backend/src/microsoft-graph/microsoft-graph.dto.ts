export interface SendMailRequest {
  to: string | string[];
  subject: string;
  body: string;
  /** 'text' (default) or 'html' */
  contentType?: 'text' | 'html';
  cc?: string | string[];
  bcc?: string | string[];
  /** Optional file attachments */
  attachments?: MailAttachment[];
  /** Save to Sent Items (default: true) */
  saveToSentItems?: boolean;
}

export interface MailAttachment {
  name: string;
  /** Base64-encoded content */
  contentBytes: string;
  contentType: string;
}

export interface SendMailResponse {
  success: boolean;
  message: string;
}
