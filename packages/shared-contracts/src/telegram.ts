import { IndianLanguage } from './session.js';

export type TelegramBindingStatus = 'pending_verification' | 'active' | 'revoked';

export interface TelegramChatBinding {
  chatId: number | string;
  caseId: string;
  sessionId: string;
  verificationCode: string;
  verifiedAt?: string;
  expiresAt: string;
  status: TelegramBindingStatus;
  consentGiven: boolean;
  languagePreference: IndianLanguage;
}

export interface TelegramMessage {
  messageId: number;
  chatId: number | string;
  from?: { id: number; firstName?: string; username?: string };
  text?: string;
  voice?: { fileId: string; duration: number; mimeType?: string; fileSize?: number };
  document?: { fileId: string; fileName?: string; fileSize?: number; mimeType?: string };
  photo?: Array<{ fileId: string; fileSize?: number }>;
  timestamp: string;
}

export interface TelegramUpdate {
  updateId: number;
  message?: TelegramMessage;
}

export interface TelegramDeliveryJob {
  jobId: string;
  idempotencyKey: string;
  caseId: string;
  chatId: number | string;
  reportType: 'summary' | 'pdf';
  reportVersion: number;
  status: 'queued' | 'sending' | 'delivered' | 'failed';
  attemptCount: number;
  deliveredAt?: string;
  error?: string;
  createdAt: string;
}

export type TelegramBotCommand =
  | 'start'
  | 'link'
  | 'cases'
  | 'status'
  | 'add_document'
  | 'start_review'
  | 'ask'
  | 'language'
  | 'report'
  | 'help'
  | 'stop';

