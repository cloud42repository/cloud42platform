import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoWorkdriveController } from '../../zoho-workdrive/zoho-workdrive.controller';

describe('ZohoWorkdriveController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoWorkdriveController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoWorkdriveController>(ZohoWorkdriveController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Teams ---
  it('GET /zoho-workdrive/teams → listTeams()', async () => {
    const result = await controller.listTeams();
    expect(result).toBeDefined();
  });

  it('GET /zoho-workdrive/teams/:id → getTeam()', async () => {
    const result = await controller.getTeam('000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-workdrive/teams/:teamId/files/search → searchFiles()', async () => {
    const result = await controller.searchFiles('000000000000001', 'test');
    expect(result).toBeDefined();
  });

  // --- Folders ---
  it('GET /zoho-workdrive/folders/:id → getFolder()', async () => {
    const result = await controller.getFolder('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-workdrive/folders → createFolder()', async () => {
    const result = await controller.createFolder({ name: 'Test Folder', parent_id: '000000000000002' });
    expect(result).toBeDefined();
  });

  it('PATCH /zoho-workdrive/folders/:id/rename → renameFolder()', async () => {
    const result = await controller.renameFolder('000000000000001', { name: 'Renamed' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-workdrive/folders/:id → deleteFolder()', async () => {
    const result = await controller.deleteFolder('000000000000001');
    expect(result).toBeDefined();
  });

  it('GET /zoho-workdrive/folders/:folderId/files → listFolderContents()', async () => {
    const result = await controller.listFolderContents('000000000000001', {});
    expect(result).toBeDefined();
  });

  // --- Files ---
  it('GET /zoho-workdrive/files/:id → getFile()', async () => {
    const result = await controller.getFile('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-workdrive/files/:fileId/copy → copyFile()', async () => {
    const result = await controller.copyFile('000000000000001', { targetFolderId: '000000000000002' });
    expect(result).toBeDefined();
  });

  it('PATCH /zoho-workdrive/files/:fileId/move → moveFile()', async () => {
    const result = await controller.moveFile('000000000000001', { targetFolderId: '000000000000002' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-workdrive/files/:id → deleteFile()', async () => {
    const result = await controller.deleteFile('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Share Links ---
  it('POST /zoho-workdrive/sharelinks → createShareLink()', async () => {
    const result = await controller.createShareLink({ resource_id: '000000000000001', link_type: 'view' });
    expect(result).toBeDefined();
  });

  it('GET /zoho-workdrive/files/:fileId/sharelinks → getShareLink()', async () => {
    const result = await controller.getShareLink('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Workspace Members ---
  it('GET /zoho-workdrive/workspaces/:workspaceId/members → listWorkspaceMembers()', async () => {
    const result = await controller.listWorkspaceMembers('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-workdrive/workspaces/:workspaceId/members → addWorkspaceMember()', async () => {
    const result = await controller.addWorkspaceMember('000000000000001', { email: 'test@test.com', role: 'editor' });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-workdrive/workspaces/:workspaceId/members/:memberId → removeWorkspaceMember()', async () => {
    const result = await controller.removeWorkspaceMember('000000000000001', '000000000000002');
    expect(result).toBeDefined();
  });
});
