import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZohoCreatorService } from './zoho-creator.service';

@Controller('zoho-creator')
export class ZohoCreatorController {
  constructor(private readonly service: ZohoCreatorService) {}

  @Get('applications')
  listApplications() { return this.service.listApplications(); }

  @Get('applications/:appLinkName')
  getApplication(@Param('appLinkName') appLinkName: string) { return this.service.getApplication(appLinkName); }

  @Get('applications/:appLinkName/forms')
  listForms(@Param('appLinkName') appLinkName: string) { return this.service.listForms(appLinkName); }

  @Get('applications/:appLinkName/forms/:formLinkName')
  getForm(@Param('appLinkName') appLinkName: string, @Param('formLinkName') formLinkName: string) {
    return this.service.getForm(appLinkName, formLinkName);
  }

  @Get('applications/:appLinkName/reports/:reportLinkName/records')
  listRecords(
    @Param('appLinkName') appLinkName: string,
    @Param('reportLinkName') reportLinkName: string,
    @Query() params: Record<string, unknown>,
  ) { return this.service.listRecords(appLinkName, reportLinkName, params); }

  @Get('applications/:appLinkName/reports/:reportLinkName/records/:id')
  getRecord(
    @Param('appLinkName') appLinkName: string,
    @Param('reportLinkName') reportLinkName: string,
    @Param('id') id: string,
  ) { return this.service.getRecord(appLinkName, reportLinkName, id); }

  @Post('applications/:appLinkName/forms/:formLinkName/records')
  createRecord(
    @Param('appLinkName') appLinkName: string,
    @Param('formLinkName') formLinkName: string,
    @Body() data: unknown,
  ) { return this.service.createRecord(appLinkName, formLinkName, data); }

  @Put('applications/:appLinkName/reports/:reportLinkName/records/:id')
  updateRecord(
    @Param('appLinkName') appLinkName: string,
    @Param('reportLinkName') reportLinkName: string,
    @Param('id') id: string,
    @Body() data: unknown,
  ) { return this.service.updateRecord(appLinkName, reportLinkName, id, data); }

  @Delete('applications/:appLinkName/reports/:reportLinkName/records/:id')
  deleteRecord(
    @Param('appLinkName') appLinkName: string,
    @Param('reportLinkName') reportLinkName: string,
    @Param('id') id: string,
  ) { return this.service.deleteRecord(appLinkName, reportLinkName, id); }

  @Get('applications/:appLinkName/reports/:reportLinkName/records/search')
  searchRecords(
    @Param('appLinkName') appLinkName: string,
    @Param('reportLinkName') reportLinkName: string,
    @Query('criteria') criteria: string,
    @Query() params: Record<string, unknown>,
  ) { return this.service.searchRecords(appLinkName, reportLinkName, criteria, params); }

  @Get('applications/:appLinkName/reports')
  listReports(@Param('appLinkName') appLinkName: string) { return this.service.listReports(appLinkName); }

  @Post('applications/:appLinkName/workflows/:workflowName/trigger')
  triggerWorkflow(
    @Param('appLinkName') appLinkName: string,
    @Param('workflowName') workflowName: string,
    @Body() data: Record<string, unknown>,
  ) { return this.service.triggerWorkflow(appLinkName, workflowName, data); }
}
