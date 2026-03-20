import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoCrmService } from './zoho-crm.service';

@Controller('zoho-crm')
export class ZohoCrmController {
  constructor(private readonly service: ZohoCrmService) {}

  // ─── Leads ───────────────────────────────────────────────────────────────
  @Get('leads')
  listLeads(@Query() params: Record<string, unknown>) { return this.service.listLeads(params); }

  @Get('leads/search')
  searchLeads(@Query() params: Record<string, unknown>) { return this.service.searchLeads(params); }

  @Get('leads/:id')
  getLead(@Param('id') id: string) { return this.service.getLead(id); }

  @Post('leads')
  createLeads(@Body() body: { data: unknown[] }) { return this.service.createLeads(body.data); }

  @Put('leads')
  updateLeads(@Body() body: { data: unknown[] }) { return this.service.updateLeads(body.data); }

  @Delete('leads/:id')
  deleteLead(@Param('id') id: string) { return this.service.deleteLead(id); }

  // ─── Contacts ────────────────────────────────────────────────────────────
  @Get('contacts')
  listContacts(@Query() params: Record<string, unknown>) { return this.service.listContacts(params); }

  @Get('contacts/search')
  searchContacts(@Query() params: Record<string, unknown>) { return this.service.searchContacts(params); }

  @Get('contacts/:id')
  getContact(@Param('id') id: string) { return this.service.getContact(id); }

  @Post('contacts')
  createContacts(@Body() body: { data: unknown[] }) { return this.service.createContacts(body.data); }

  @Put('contacts')
  updateContacts(@Body() body: { data: unknown[] }) { return this.service.updateContacts(body.data); }

  @Delete('contacts/:id')
  deleteContact(@Param('id') id: string) { return this.service.deleteContact(id); }

  // ─── Accounts ────────────────────────────────────────────────────────────
  @Get('accounts')
  listAccounts(@Query() params: Record<string, unknown>) { return this.service.listAccounts(params); }

  @Get('accounts/:id')
  getAccount(@Param('id') id: string) { return this.service.getAccount(id); }

  @Post('accounts')
  createAccounts(@Body() body: { data: unknown[] }) { return this.service.createAccounts(body.data); }

  @Put('accounts')
  updateAccounts(@Body() body: { data: unknown[] }) { return this.service.updateAccounts(body.data); }

  @Delete('accounts/:id')
  deleteAccount(@Param('id') id: string) { return this.service.deleteAccount(id); }

  // ─── Deals ───────────────────────────────────────────────────────────────
  @Get('deals')
  listDeals(@Query() params: Record<string, unknown>) { return this.service.listDeals(params); }

  @Get('deals/:id')
  getDeal(@Param('id') id: string) { return this.service.getDeal(id); }

  @Post('deals')
  createDeals(@Body() body: { data: unknown[] }) { return this.service.createDeals(body.data); }

  @Put('deals')
  updateDeals(@Body() body: { data: unknown[] }) { return this.service.updateDeals(body.data); }

  @Delete('deals/:id')
  deleteDeal(@Param('id') id: string) { return this.service.deleteDeal(id); }

  // ─── Tasks ───────────────────────────────────────────────────────────────
  @Get('tasks')
  listTasks(@Query() params: Record<string, unknown>) { return this.service.listTasks(params); }

  @Get('tasks/:id')
  getTask(@Param('id') id: string) { return this.service.getTask(id); }

  @Post('tasks')
  createTasks(@Body() body: { data: unknown[] }) { return this.service.createTasks(body.data); }

  @Put('tasks')
  updateTasks(@Body() body: { data: unknown[] }) { return this.service.updateTasks(body.data); }

  @Delete('tasks/:id')
  deleteTask(@Param('id') id: string) { return this.service.deleteTask(id); }

  // ─── Notes ───────────────────────────────────────────────────────────────
  @Get('notes')
  listNotes(@Query() params: Record<string, unknown>) { return this.service.listNotes(params); }

  @Get('notes/:id')
  getNote(@Param('id') id: string) { return this.service.getNote(id); }

  @Post('notes')
  createNotes(@Body() body: { data: unknown[] }) { return this.service.createNotes(body.data); }

  @Delete('notes/:id')
  deleteNote(@Param('id') id: string) { return this.service.deleteNote(id); }

  // ─── Generic module ──────────────────────────────────────────────────────
  @Get('modules/:module')
  listRecords(@Param('module') module: string, @Query() params: Record<string, unknown>) {
    return this.service.listRecords(module, params);
  }

  @Get('modules/:module/:id')
  getRecord(@Param('module') module: string, @Param('id') id: string) {
    return this.service.getRecord(module, id);
  }

  @Post('modules/:module')
  createRecords(@Param('module') module: string, @Body() body: { data: unknown[] }) {
    return this.service.createRecords(module, body.data);
  }

  @Put('modules/:module')
  updateRecords(@Param('module') module: string, @Body() body: { data: unknown[] }) {
    return this.service.updateRecords(module, body.data);
  }

  @Delete('modules/:module/:id')
  deleteRecord(@Param('module') module: string, @Param('id') id: string) {
    return this.service.deleteRecord(module, id);
  }

  @Get('modules/:module/search')
  searchRecords(@Param('module') module: string, @Query() params: Record<string, unknown>) {
    return this.service.searchRecords(module, params);
  }

  // ── OAuth ────────────────────────────────────────────────────────────
  @Get('oauth/authorize') getAuthUrl(@Query('scope') scope: string) { return this.service.getAuthUrl(scope); }
  @Post('oauth/exchange') exchangeGrantCode(@Body() body: { code: string }) { return this.service.exchangeGrantCode(body.code); }
  @Post('oauth/revoke') revokeAuth() { return this.service.revokeAuth(); }
}
