import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

const PREFIX = '/zoho-salesiq';

@Injectable({ providedIn: 'root' })
export class ZohoSalesiqService {
  private readonly api = inject(ApiService);

  // Visitors
  listVisitors(screenName: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/:screenName/visitors', { screenName }, query);
  }
  getVisitor(screenName: string, visitorId: string) {
    return this.api.get(PREFIX, '/:screenName/visitors/:visitorId', { screenName, visitorId });
  }
  searchVisitors(screenName: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/:screenName/visitors/search', { screenName }, query);
  }

  // Chats
  listChats(screenName: string, query: Record<string, string> = {}) {
    return this.api.get(PREFIX, '/:screenName/chats', { screenName }, query);
  }
  getChat(screenName: string, chatId: string) {
    return this.api.get(PREFIX, '/:screenName/chats/:chatId', { screenName, chatId });
  }
  listChatMessages(screenName: string, chatId: string) {
    return this.api.get(PREFIX, '/:screenName/chats/:chatId/messages', { screenName, chatId });
  }
  sendChatMessage(screenName: string, chatId: string, body: unknown) {
    return this.api.post(PREFIX, '/:screenName/chats/:chatId/messages', { screenName, chatId }, body);
  }
  setRating(screenName: string, chatId: string, body: unknown) {
    return this.api.post(PREFIX, '/:screenName/chats/:chatId/rating', { screenName, chatId }, body);
  }

  // Operators
  listOperators(screenName: string) {
    return this.api.get(PREFIX, '/:screenName/operators', { screenName });
  }
  getOperator(screenName: string, operatorId: string) {
    return this.api.get(PREFIX, '/:screenName/operators/:operatorId', { screenName, operatorId });
  }
  setOperatorAvailability(screenName: string, operatorId: string, body: unknown) {
    return this.api.post(PREFIX, '/:screenName/operators/:operatorId/availability', { screenName, operatorId }, body);
  }

  // Departments
  listDepartments(screenName: string) {
    return this.api.get(PREFIX, '/:screenName/departments', { screenName });
  }
  getDepartment(screenName: string, id: string) {
    return this.api.get(PREFIX, '/:screenName/departments/:id', { screenName, id });
  }

  // Bots
  listBots(screenName: string) {
    return this.api.get(PREFIX, '/:screenName/bots', { screenName });
  }
  sendBotMessage(screenName: string, botId: string, body: unknown) {
    return this.api.post(PREFIX, '/:screenName/bots/:botId/message', { screenName, botId }, body);
  }

  // Feedback Forms
  listFeedbackForms(screenName: string) {
    return this.api.get(PREFIX, '/:screenName/feedback-forms', { screenName });
  }
}
