import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoMailService } from './zoho-mail.service';

@Controller('zoho-mail')
export class ZohoMailController {
  constructor(private readonly service: ZohoMailService) {}

  @Get('accounts') listAccounts() { return this.service.listAccounts(); }
  @Get('accounts/:accountId') getAccount(@Param('accountId') id: string) { return this.service.getAccount(id); }

  @Get('accounts/:accountId/folders') listFolders(@Param('accountId') id: string) { return this.service.listFolders(id); }

  @Get('accounts/:accountId/folders/:folderId/messages') listMessages(@Param('accountId') aId: string, @Param('folderId') fId: string, @Query() q: Record<string, unknown>) { return this.service.listMessages(aId, fId, q); }
  @Get('accounts/:accountId/messages/search') searchMessages(@Param('accountId') aId: string, @Query('searchKey') key: string, @Query() q: Record<string, unknown>) { return this.service.searchMessages(aId, key, q); }
  @Get('accounts/:accountId/messages/:messageId') getMessage(@Param('accountId') aId: string, @Param('messageId') mId: string) { return this.service.getMessage(aId, mId); }
  @Post('accounts/:accountId/messages') sendMessage(@Param('accountId') aId: string, @Body() body: unknown) { return this.service.sendMessage(aId, body); }
  @Delete('accounts/:accountId/messages/:messageId') deleteMessage(@Param('accountId') aId: string, @Param('messageId') mId: string) { return this.service.deleteMessage(aId, mId); }
  @Post('accounts/:accountId/messages/:messageId/move') moveMessage(@Param('accountId') aId: string, @Param('messageId') mId: string, @Body() body: { targetFolderId: string }) { return this.service.moveMessage(aId, mId, body.targetFolderId); }
  @Post('accounts/:accountId/messages/:messageId/read') markRead(@Param('accountId') aId: string, @Param('messageId') mId: string, @Body() body: { isRead: boolean }) { return this.service.markRead(aId, mId, body.isRead); }

  @Get('accounts/:accountId/contacts') listContacts(@Param('accountId') aId: string) { return this.service.listContacts(aId); }
  @Post('accounts/:accountId/contacts') createContact(@Param('accountId') aId: string, @Body() body: unknown) { return this.service.createContact(aId, body); }
  @Delete('accounts/:accountId/contacts/:contactId') deleteContact(@Param('accountId') aId: string, @Param('contactId') cId: string) { return this.service.deleteContact(aId, cId); }
}
