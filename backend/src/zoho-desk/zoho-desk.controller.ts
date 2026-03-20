import {
  Controller, Get, Post, Put, Delete, Patch, Param, Body, Query,
} from '@nestjs/common';
import { ZohoDeskService } from './zoho-desk.service';

@Controller('zoho-desk')
export class ZohoDeskController {
  constructor(private readonly service: ZohoDeskService) {}

  @Get('tickets') listTickets(@Query() q: Record<string, unknown>) { return this.service.listTickets(q); }
  @Get('tickets/search') searchTickets(@Query() q: Record<string, unknown>) { return this.service.searchTickets(q); }
  @Get('tickets/:id') getTicket(@Param('id') id: string) { return this.service.getTicket(id); }
  @Post('tickets') createTicket(@Body() body: unknown) { return this.service.createTicket(body); }
  @Patch('tickets/:id') updateTicket(@Param('id') id: string, @Body() body: unknown) { return this.service.updateTicket(id, body); }
  @Delete('tickets/:id') deleteTicket(@Param('id') id: string) { return this.service.deleteTicket(id); }

  @Get('tickets/:ticketId/comments') listComments(@Param('ticketId') ticketId: string) { return this.service.listComments(ticketId); }
  @Post('tickets/:ticketId/comments') addComment(@Param('ticketId') ticketId: string, @Body() body: unknown) { return this.service.addComment(ticketId, body); }
  @Delete('tickets/:ticketId/comments/:commentId') deleteComment(@Param('ticketId') ticketId: string, @Param('commentId') commentId: string) { return this.service.deleteComment(ticketId, commentId); }

  @Get('contacts') listContacts(@Query() q: Record<string, unknown>) { return this.service.listContacts(q); }
  @Get('contacts/:id') getContact(@Param('id') id: string) { return this.service.getContact(id); }
  @Post('contacts') createContact(@Body() body: unknown) { return this.service.createContact(body); }
  @Patch('contacts/:id') updateContact(@Param('id') id: string, @Body() body: unknown) { return this.service.updateContact(id, body); }
  @Delete('contacts/:id') deleteContact(@Param('id') id: string) { return this.service.deleteContact(id); }

  @Get('agents') listAgents(@Query() q: Record<string, unknown>) { return this.service.listAgents(q); }
  @Get('agents/:id') getAgent(@Param('id') id: string) { return this.service.getAgent(id); }

  @Get('departments') listDepartments() { return this.service.listDepartments(); }
  @Get('departments/:id') getDepartment(@Param('id') id: string) { return this.service.getDepartment(id); }

  // ── OAuth ────────────────────────────────────────────────────────────
  @Get('oauth/authorize') getAuthUrl(@Query('scope') scope: string) { return this.service.getAuthUrl(scope); }
  @Post('oauth/exchange') exchangeGrantCode(@Body() body: { code: string }) { return this.service.exchangeGrantCode(body.code); }
  @Post('oauth/revoke') revokeAuth() { return this.service.revokeAuth(); }
}
