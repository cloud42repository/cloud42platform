import {
  Controller, Get, Post, Delete, Patch, Param, Body, Query,
} from '@nestjs/common';
import { ZohoWorkdriveService } from './zoho-workdrive.service';

@Controller('zoho-workdrive')
export class ZohoWorkdriveController {
  constructor(private readonly service: ZohoWorkdriveService) {}

  @Get('teams') listTeams() { return this.service.listTeams(); }
  @Get('teams/:id') getTeam(@Param('id') id: string) { return this.service.getTeam(id); }
  @Get('teams/:teamId/files/search') searchFiles(@Param('teamId') teamId: string, @Query('q') query: string) { return this.service.searchFiles(teamId, query); }

  @Get('folders/:id') getFolder(@Param('id') id: string) { return this.service.getFolder(id); }
  @Post('folders') createFolder(@Body() body: unknown) { return this.service.createFolder(body); }
  @Patch('folders/:id/rename') renameFolder(@Param('id') id: string, @Body() body: { name: string }) { return this.service.renameFolder(id, body.name); }
  @Delete('folders/:id') deleteFolder(@Param('id') id: string) { return this.service.deleteFolder(id); }
  @Get('folders/:folderId/files') listFolderContents(@Param('folderId') fId: string, @Query() q: Record<string, unknown>) { return this.service.listFolderContents(fId, q); }

  @Get('files/:id') getFile(@Param('id') id: string) { return this.service.getFile(id); }
  @Post('files/:fileId/copy') copyFile(@Param('fileId') fId: string, @Body() body: { targetFolderId: string }) { return this.service.copyFile(fId, body.targetFolderId); }
  @Patch('files/:fileId/move') moveFile(@Param('fileId') fId: string, @Body() body: { targetFolderId: string }) { return this.service.moveFile(fId, body.targetFolderId); }
  @Delete('files/:id') deleteFile(@Param('id') id: string) { return this.service.deleteFile(id); }

  @Post('sharelinks') createShareLink(@Body() body: unknown) { return this.service.createShareLink(body); }
  @Get('files/:fileId/sharelinks') getShareLink(@Param('fileId') fId: string) { return this.service.getShareLink(fId); }

  @Get('workspaces/:workspaceId/members') listWorkspaceMembers(@Param('workspaceId') wsId: string) { return this.service.listWorkspaceMembers(wsId); }
  @Post('workspaces/:workspaceId/members') addWorkspaceMember(@Param('workspaceId') wsId: string, @Body() body: { email: string; role: string }) { return this.service.addWorkspaceMember(wsId, body.email, body.role); }
  @Delete('workspaces/:workspaceId/members/:memberId') removeWorkspaceMember(@Param('workspaceId') wsId: string, @Param('memberId') mId: string) { return this.service.removeWorkspaceMember(wsId, mId); }
}
