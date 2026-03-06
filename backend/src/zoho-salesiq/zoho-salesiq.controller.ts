import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ZohoSalesIQService } from './zoho-salesiq.service';

@Controller('zoho-salesiq')
export class ZohoSalesIQController {
  constructor(private readonly service: ZohoSalesIQService) {}

  @Get(':screenName/visitors')
  listVisitors(@Param('screenName') screenName: string, @Query() params: Record<string, unknown>) {
    return this.service.listVisitors(screenName, params);
  }

  @Get(':screenName/visitors/:visitorId')
  getVisitor(@Param('screenName') screenName: string, @Param('visitorId') visitorId: string) {
    return this.service.getVisitor(screenName, visitorId);
  }

  @Get(':screenName/visitors/search')
  searchVisitors(@Param('screenName') screenName: string, @Query() params: Record<string, unknown>) {
    return this.service.searchVisitors(screenName, params);
  }

  @Get(':screenName/chats')
  listChats(@Param('screenName') screenName: string, @Query() params: Record<string, unknown>) {
    return this.service.listChats(screenName, params);
  }

  @Get(':screenName/chats/:chatId')
  getChat(@Param('screenName') screenName: string, @Param('chatId') chatId: string) {
    return this.service.getChat(screenName, chatId);
  }

  @Get(':screenName/chats/:chatId/messages')
  listChatMessages(@Param('screenName') screenName: string, @Param('chatId') chatId: string) {
    return this.service.listChatMessages(screenName, chatId);
  }

  @Post(':screenName/chats/:chatId/messages')
  sendChatMessage(
    @Param('screenName') screenName: string,
    @Param('chatId') chatId: string,
    @Body('text') text: string,
  ) { return this.service.sendChatMessage(screenName, chatId, text); }

  @Post(':screenName/chats/:chatId/rating')
  setRating(
    @Param('screenName') screenName: string,
    @Param('chatId') chatId: string,
    @Body('rating') rating: number,
  ) { return this.service.setRating(screenName, chatId, rating); }

  @Get(':screenName/operators')
  listOperators(@Param('screenName') screenName: string) { return this.service.listOperators(screenName); }

  @Get(':screenName/operators/:operatorId')
  getOperator(@Param('screenName') screenName: string, @Param('operatorId') operatorId: string) {
    return this.service.getOperator(screenName, operatorId);
  }

  @Post(':screenName/operators/:operatorId/availability')
  setOperatorAvailability(
    @Param('screenName') screenName: string,
    @Param('operatorId') operatorId: string,
    @Body('status') status: string,
  ) { return this.service.setOperatorAvailability(screenName, operatorId, status); }

  @Get(':screenName/departments')
  listDepartments(@Param('screenName') screenName: string) { return this.service.listDepartments(screenName); }

  @Get(':screenName/departments/:id')
  getDepartment(@Param('screenName') screenName: string, @Param('id') id: string) {
    return this.service.getDepartment(screenName, id);
  }

  @Get(':screenName/bots')
  listBots(@Param('screenName') screenName: string) { return this.service.listBots(screenName); }

  @Post(':screenName/bots/:botId/messages')
  sendBotMessage(
    @Param('screenName') screenName: string,
    @Param('botId') botId: string,
    @Body() payload: unknown,
  ) { return this.service.sendBotMessage(screenName, botId, payload); }

  @Get(':screenName/feedback-forms')
  listFeedbackForms(@Param('screenName') screenName: string) { return this.service.listFeedbackForms(screenName); }
}
