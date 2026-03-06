import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZohoSalesIQClient } from './ZohoSalesIQClient';

@Injectable()
export class ZohoSalesIQService {
  readonly client: ZohoSalesIQClient;

  constructor(private readonly config: ConfigService) {
    this.client = new ZohoSalesIQClient({
      clientId: config.getOrThrow('ZOHO_CLIENT_ID'),
      clientSecret: config.getOrThrow('ZOHO_CLIENT_SECRET'),
      refreshToken: config.getOrThrow('ZOHO_REFRESH_TOKEN'),
      accountsUrl: config.get('ZOHO_ACCOUNTS_URL'),
    });
  }

  listVisitors(screenName: string, params?: Record<string, unknown>) { return this.client.listVisitors(screenName, params as any); }
  getVisitor(screenName: string, visitorId: string) { return this.client.getVisitor(screenName, visitorId); }
  searchVisitors(screenName: string, params: Record<string, unknown>) { return this.client.searchVisitors(screenName, params as any); }

  listChats(screenName: string, params?: Record<string, unknown>) { return this.client.listChats(screenName, params as any); }
  getChat(screenName: string, chatId: string) { return this.client.getChat(screenName, chatId); }
  listChatMessages(screenName: string, chatId: string) { return this.client.listChatMessages(screenName, chatId); }
  sendChatMessage(screenName: string, chatId: string, text: string) { return this.client.sendChatMessage(screenName, chatId, text); }
  setRating(screenName: string, chatId: string, rating: number) { return this.client.setRating(screenName, chatId, rating); }

  listOperators(screenName: string) { return this.client.listOperators(screenName); }
  getOperator(screenName: string, operatorId: string) { return this.client.getOperator(screenName, operatorId); }
  setOperatorAvailability(screenName: string, operatorId: string, status: string) { return this.client.setOperatorAvailability(screenName, operatorId, status as any); }

  listDepartments(screenName: string) { return this.client.listDepartments(screenName); }
  getDepartment(screenName: string, id: string) { return this.client.getDepartment(screenName, id); }

  listBots(screenName: string) { return this.client.listBots(screenName); }
  sendBotMessage(screenName: string, botId: string, payload: unknown) { return this.client.sendBotMessage(screenName, botId, payload as any); }

  listFeedbackForms(screenName: string) { return this.client.listFeedbackForms(screenName); }
}
