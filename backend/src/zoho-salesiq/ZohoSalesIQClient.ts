import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  SalesIQVisitor,
  SalesIQChat, SalesIQMessage,
  SalesIQOperator,
  SalesIQDepartment,
  SalesIQFeedbackForm,
  SalesIQBot,
  SalesIQListParams,
} from "./zoho-salesiq.dto";

export interface ZohoSalesIQConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://salesiq.zoho.com/api/v2 */
  apiBaseUrl?: string;
}

/**
 * Zoho SalesIQ v2 API client.
 * Docs: https://www.zoho.com/salesiq/help/developer-section/rest-api-overview.html
 */
export class ZohoSalesIQClient extends ZohoBaseClient {
  constructor(config: ZohoSalesIQConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://salesiq.zoho.com/api/v2",
    });
  }

  // â”€â”€â”€ Visitors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listVisitors(screenName: string, params?: SalesIQListParams): Promise<{ visitors: SalesIQVisitor[] }> {
    return this.get(`/${screenName}/visitors`, { params });
  }
  getVisitor(screenName: string, visitorId: string): Promise<{ visitor: SalesIQVisitor }> {
    return this.get(`/${screenName}/visitors/${visitorId}`);
  }
  searchVisitors(screenName: string, params: SalesIQListParams): Promise<{ visitors: SalesIQVisitor[] }> {
    return this.get(`/${screenName}/visitors/search`, { params });
  }

  // â”€â”€â”€ Chats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listChats(screenName: string, params?: SalesIQListParams): Promise<{ chats: SalesIQChat[] }> {
    return this.get(`/${screenName}/chats`, { params });
  }
  getChat(screenName: string, chatId: string): Promise<{ chat: SalesIQChat }> {
    return this.get(`/${screenName}/chats/${chatId}`);
  }
  listChatMessages(screenName: string, chatId: string): Promise<{ messages: SalesIQMessage[] }> {
    return this.get(`/${screenName}/chats/${chatId}/messages`);
  }
  sendChatMessage(screenName: string, chatId: string, text: string): Promise<{ message: SalesIQMessage }> {
    return this.post(`/${screenName}/chats/${chatId}/messages`, { text });
  }
  setRating(screenName: string, chatId: string, rating: number): Promise<unknown> {
    return this.post(`/${screenName}/chats/${chatId}/rating`, { rating });
  }

  // â”€â”€â”€ Operators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listOperators(screenName: string): Promise<{ operators: SalesIQOperator[] }> {
    return this.get(`/${screenName}/operators`);
  }
  getOperator(screenName: string, operatorId: string): Promise<{ operator: SalesIQOperator }> {
    return this.get(`/${screenName}/operators/${operatorId}`);
  }
  setOperatorAvailability(screenName: string, operatorId: string, status: SalesIQOperator["status"]): Promise<unknown> {
    return this.post(`/${screenName}/operators/${operatorId}/online`, { status });
  }

  // â”€â”€â”€ Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listDepartments(screenName: string): Promise<{ departments: SalesIQDepartment[] }> {
    return this.get(`/${screenName}/departments`);
  }
  getDepartment(screenName: string, id: string): Promise<{ department: SalesIQDepartment }> {
    return this.get(`/${screenName}/departments/${id}`);
  }

  // â”€â”€â”€ Bots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listBots(screenName: string): Promise<{ bots: SalesIQBot[] }> {
    return this.get(`/${screenName}/bots`);
  }
  sendBotMessage(screenName: string, botId: string, payload: Record<string, unknown>): Promise<unknown> {
    return this.post(`/${screenName}/bots/${botId}/send`, payload);
  }

  // â”€â”€â”€ Feedback Forms â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listFeedbackForms(screenName: string): Promise<{ feedbackforms: SalesIQFeedbackForm[] }> {
    return this.get(`/${screenName}/feedbackforms`);
  }
}
