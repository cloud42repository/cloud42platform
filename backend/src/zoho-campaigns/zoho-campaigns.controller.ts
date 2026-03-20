import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoCampaignsService } from './zoho-campaigns.service';

@Controller('zoho-campaigns')
export class ZohoCampaignsController {
  constructor(private readonly service: ZohoCampaignsService) {}

  @Get('lists') listMailingLists(@Query() q: Record<string, unknown>) { return this.service.listMailingLists(q); }
  @Get('lists/:listKey') getMailingList(@Param('listKey') key: string) { return this.service.getMailingList(key); }
  @Post('lists') createMailingList(@Body() body: unknown) { return this.service.createMailingList(body); }
  @Delete('lists/:listKey') deleteMailingList(@Param('listKey') key: string) { return this.service.deleteMailingList(key); }

  @Get('lists/:listKey/subscribers') listSubscribers(@Param('listKey') key: string, @Query() q: Record<string, unknown>) { return this.service.listSubscribers(key, q); }
  @Post('lists/:listKey/subscribers') addSubscriber(@Param('listKey') key: string, @Body() body: unknown) { return this.service.addSubscriber(key, body); }
  @Delete('lists/:listKey/subscribers') removeSubscriber(@Param('listKey') key: string, @Query('email') email: string) { return this.service.removeSubscriber(key, email); }

  @Get('topics') listTopics() { return this.service.listTopics(); }

  @Get('campaigns') listCampaigns(@Query() q: Record<string, unknown>) { return this.service.listCampaigns(q); }
  @Get('campaigns/:campaignKey') getCampaign(@Param('campaignKey') key: string) { return this.service.getCampaign(key); }
  @Post('campaigns/:campaignKey/send') sendCampaign(@Param('campaignKey') key: string) { return this.service.sendCampaign(key); }
  @Post('campaigns/:campaignKey/schedule') scheduleCampaign(@Param('campaignKey') key: string, @Body() body: { scheduleTime: string }) { return this.service.scheduleCampaign(key, body.scheduleTime); }

  // ── OAuth ────────────────────────────────────────────────────────────
  @Get('oauth/authorize') getAuthUrl(@Query('scope') scope: string) { return this.service.getAuthUrl(scope); }
  @Post('oauth/exchange') exchangeGrantCode(@Body() body: { code: string }) { return this.service.exchangeGrantCode(body.code); }
  @Post('oauth/revoke') revokeAuth() { return this.service.revokeAuth(); }
}
