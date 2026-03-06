import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoSignService } from './zoho-sign.service';

@Controller('zoho-sign')
export class ZohoSignController {
  constructor(private readonly service: ZohoSignService) {}

  @Get('requests') listRequests(@Query() q: Record<string, unknown>) { return this.service.listRequests(q); }
  @Get('requests/:id') getRequest(@Param('id') id: string) { return this.service.getRequest(id); }
  @Post('requests') createRequest(@Body() body: unknown) { return this.service.createRequest(body); }
  @Post('requests/:id/send') sendRequest(@Param('id') id: string) { return this.service.sendRequest(id); }
  @Delete('requests/:id') deleteRequest(@Param('id') id: string) { return this.service.deleteRequest(id); }
  @Post('requests/:id/recall') recallRequest(@Param('id') id: string) { return this.service.recallRequest(id); }
  @Post('requests/:id/remind') remindRequest(@Param('id') id: string) { return this.service.remindRequest(id); }

  @Get('templates') listTemplates(@Query() q: Record<string, unknown>) { return this.service.listTemplates(q); }
  @Get('templates/:id') getTemplate(@Param('id') id: string) { return this.service.getTemplate(id); }
  @Post('templates/:id/create-request') createRequestFromTemplate(@Param('id') id: string, @Body() body: unknown) { return this.service.createRequestFromTemplate(id, body); }

  @Get('requests/:requestId/documents/:documentId') getDocument(@Param('requestId') reqId: string, @Param('documentId') docId: string) { return this.service.getDocument(reqId, docId); }
  @Get('requests/:requestId/documents/:documentId/download') downloadDocument(@Param('requestId') reqId: string, @Param('documentId') docId: string) { return this.service.downloadDocument(reqId, docId); }
}
