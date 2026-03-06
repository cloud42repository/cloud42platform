import {
  Controller, Get, Post, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoAnalyticsService } from './zoho-analytics.service';

@Controller('zoho-analytics')
export class ZohoAnalyticsController {
  constructor(private readonly service: ZohoAnalyticsService) {}

  @Get('workspaces') listWorkspaces() { return this.service.listWorkspaces(); }
  @Get('workspaces/:id') getWorkspace(@Param('id') id: string) { return this.service.getWorkspace(id); }
  @Post('workspaces') createWorkspace(@Body() body: unknown) { return this.service.createWorkspace(body); }
  @Delete('workspaces/:id') deleteWorkspace(@Param('id') id: string) { return this.service.deleteWorkspace(id); }

  @Get('workspaces/:workspaceId/views') listViews(@Param('workspaceId') wsId: string, @Query() q: Record<string, unknown>) { return this.service.listViews(wsId, q); }
  @Get('workspaces/:workspaceId/views/:viewId') getView(@Param('workspaceId') wsId: string, @Param('viewId') viewId: string) { return this.service.getView(wsId, viewId); }
  @Post('workspaces/:workspaceId/views') createView(@Param('workspaceId') wsId: string, @Body() body: unknown) { return this.service.createView(wsId, body); }
  @Delete('workspaces/:workspaceId/views/:viewId') deleteView(@Param('workspaceId') wsId: string, @Param('viewId') viewId: string) { return this.service.deleteView(wsId, viewId); }

  @Get('workspaces/:workspaceId/reports') listReports(@Param('workspaceId') wsId: string) { return this.service.listReports(wsId); }
  @Get('workspaces/:workspaceId/dashboards') listDashboards(@Param('workspaceId') wsId: string) { return this.service.listDashboards(wsId); }

  @Post('import') importData(@Body() body: { config: unknown; data: unknown }) { return this.service.importData(body.config, body.data); }
  @Get('workspaces/:workspaceId/views/:viewId/export') exportData(
    @Param('workspaceId') wsId: string,
    @Param('viewId') viewId: string,
    @Query('format') format: 'csv' | 'json' | 'xlsx',
  ) { return this.service.exportData(wsId, viewId, format); }
}
