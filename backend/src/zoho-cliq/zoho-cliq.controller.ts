import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoCliqService } from './zoho-cliq.service';

@Controller('zoho-cliq')
export class ZohoCliqController {
  constructor(private readonly service: ZohoCliqService) {}

  @Get('channels') listChannels(@Query() q: Record<string, unknown>) { return this.service.listChannels(q); }
  @Get('channels/:name') getChannel(@Param('name') name: string) { return this.service.getChannel(name); }
  @Post('channels') createChannel(@Body() body: unknown) { return this.service.createChannel(body); }
  @Delete('channels/:name') deleteChannel(@Param('name') name: string) { return this.service.deleteChannel(name); }
  @Post('channels/:name/members') addChannelMember(@Param('name') name: string, @Body() body: { emails: string[] }) { return this.service.addChannelMember(name, body.emails); }
  @Delete('channels/:name/members') removeChannelMember(@Param('name') name: string, @Query('email') email: string) { return this.service.removeChannelMember(name, email); }

  @Get('channels/:name/messages') listChannelMessages(@Param('name') name: string) { return this.service.listChannelMessages(name); }
  @Post('channels/:name/message') sendChannelMessage(@Param('name') name: string, @Body() body: unknown) { return this.service.sendChannelMessage(name, body); }
  @Delete('channels/:name/messages/:messageId') deleteMessage(@Param('name') name: string, @Param('messageId') mId: string) { return this.service.deleteMessage(name, mId); }

  @Post('direct/:email') sendDirectMessage(@Param('email') email: string, @Body() body: unknown) { return this.service.sendDirectMessage(email, body); }

  @Get('usergroups') listUserGroups() { return this.service.listUserGroups(); }
  @Get('usergroups/:name') getUserGroup(@Param('name') name: string) { return this.service.getUserGroup(name); }
  @Post('usergroups') createUserGroup(@Body() body: unknown) { return this.service.createUserGroup(body); }

  @Get('bots') listBots() { return this.service.listBots(); }
  @Post('bots/:name/message') sendBotMessage(@Param('name') name: string, @Body() body: unknown) { return this.service.sendBotMessage(name, body); }
}
