import { ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Account / Mailbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface MailAccount {
  accountId?: string;
  accountName?: string;
  emailAddress?: string;
  displayName?: string;
  incomingServer?: string;
  outgoingServer?: string;
  isPrimary?: boolean;
  isEnabled?: boolean;
}

// â”€â”€â”€ Folder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type SystemFolderType = "Inbox" | "Sent" | "Drafts" | "Trash" | "Spam" | "Archive";

export interface MailFolder {
  folderId?: string;
  folderName?: string;
  systemFolder?: SystemFolderType;
  unreadCount?: number;
  messageCount?: number;
}

// â”€â”€â”€ Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type MessageStatus = "read" | "unread";

export interface MailMessage {
  messageId?: string;
  subject?: string;
  sender?: string;
  fromAddress?: string;
  toAddress?: string;
  ccAddress?: string;
  bccAddress?: string;
  sentDateInGMT?: string;
  folderId?: string;
  status?: MessageStatus;
  content?: string;
  contentType?: "text/plain" | "text/html";
  hasAttachment?: boolean;
  attachments?: MailAttachment[];
}

export interface SendMessageDTO {
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  bccAddress?: string;
  subject: string;
  content: string;
  mailFormat?: "html" | "plaintext";
  askReceipt?: "yes" | "no";
  attachments?: string[];
}

// â”€â”€â”€ Attachment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface MailAttachment {
  attachmentId?: string;
  attachmentName?: string;
  attachmentSize?: number;
  mimeType?: string;
}

// â”€â”€â”€ Contact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface MailContact {
  contactId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface CreateMailContactDTO {
  firstName?: string;
  lastName: string;
  email: string;
  phone?: string;
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface MailListParams extends ZohoListParams {
  folderId?: string;
  searchKey?: string;
  status?: MessageStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
