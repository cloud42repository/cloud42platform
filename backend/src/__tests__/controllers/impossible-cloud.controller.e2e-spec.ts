import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ImpossibleCloudController } from '../../impossible-cloud/impossible-cloud.controller';

describe('ImpossibleCloudController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ImpossibleCloudController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ImpossibleCloudController>(ImpossibleCloudController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Regions ---
  it('GET /impossible-cloud/regions → listRegions()', async () => {
    const result = await controller.listRegions();
    expect(result).toBeDefined();
  });

  // --- Contracts ---
  it('GET /impossible-cloud/contracts → listContracts()', async () => {
    const result = await controller.listContracts();
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/contracts/:contractId/partners → listContractPartners()', async () => {
    const result = await controller.listContractPartners('contract-1');
    expect(result).toBeDefined();
  });

  // --- Partners ---
  it('POST /impossible-cloud/partners → createPartner()', async () => {
    const result = await controller.createPartner({ name: 'Test Partner', email: 'partner@test.com' });
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/partners/:partnerId → getPartner()', async () => {
    const result = await controller.getPartner('partner-1');
    expect(result).toBeDefined();
  });

  it('PUT /impossible-cloud/partners/:partnerId → updatePartner()', async () => {
    const result = await controller.updatePartner('partner-1', { name: 'Updated Partner' });
    expect(result).toBeDefined();
  });

  it('DELETE /impossible-cloud/partners/:partnerId → deletePartner()', async () => {
    const result = await controller.deletePartner('partner-1');
    expect(result).toBeDefined();
  });

  // --- Members ---
  it('GET /impossible-cloud/partners/:partnerId/members → listMembers()', async () => {
    const result = await controller.listMembers('partner-1');
    expect(result).toBeDefined();
  });

  it('POST /impossible-cloud/partners/:partnerId/members → createMember()', async () => {
    const result = await controller.createMember('partner-1', { email: 'member@test.com', role: 'admin' });
    expect(result).toBeDefined();
  });

  it('DELETE /impossible-cloud/partners/:partnerId/members/:memberId → deleteMember()', async () => {
    const result = await controller.deleteMember('partner-1', 'member-1');
    expect(result).toBeDefined();
  });

  // --- Partner Storage Accounts ---
  it('GET /impossible-cloud/partners/:partnerId/storage-accounts → listPartnerStorageAccounts()', async () => {
    const result = await controller.listPartnerStorageAccounts('partner-1');
    expect(result).toBeDefined();
  });

  it('POST /impossible-cloud/partners/:partnerId/storage-accounts → createPartnerStorageAccount()', async () => {
    const result = await controller.createPartnerStorageAccount('partner-1', { name: 'Test Account', region: 'eu-central-1' });
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/partners/:partnerId/storage-accounts/:accountId → getPartnerStorageAccount()', async () => {
    const result = await controller.getPartnerStorageAccount('partner-1', 'account-1');
    expect(result).toBeDefined();
  });

  it('DELETE /impossible-cloud/partners/:partnerId/storage-accounts/:accountId → deletePartnerStorageAccount()', async () => {
    const result = await controller.deletePartnerStorageAccount('partner-1', 'account-1');
    expect(result).toBeDefined();
  });

  it('PATCH /impossible-cloud/partners/:partnerId/storage-accounts/:accountId → patchPartnerStorageAccount()', async () => {
    const result = await controller.patchPartnerStorageAccount('partner-1', 'account-1', { name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/partners/:partnerId/storage-accounts/:accountId/usage → getPartnerStorageAccountUsage()', async () => {
    const result = await controller.getPartnerStorageAccountUsage('partner-1', 'account-1', {});
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/partners/:partnerId/usage → getPartnerUsage()', async () => {
    const result = await controller.getPartnerUsage('partner-1', {});
    expect(result).toBeDefined();
  });

  // --- Storage Accounts ---
  it('POST /impossible-cloud/storage-accounts → createStorageAccount()', async () => {
    const result = await controller.createStorageAccount({ name: 'Test SA', region: 'eu-central-1' });
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/storage-accounts → listStorageAccounts()', async () => {
    const result = await controller.listStorageAccounts();
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/storage-accounts/usage → getAllStorageAccountsUsage()', async () => {
    const result = await controller.getAllStorageAccountsUsage({});
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/storage-accounts/:accountId → getStorageAccount()', async () => {
    const result = await controller.getStorageAccount('account-1');
    expect(result).toBeDefined();
  });

  it('DELETE /impossible-cloud/storage-accounts/:accountId → deleteStorageAccount()', async () => {
    const result = await controller.deleteStorageAccount('account-1');
    expect(result).toBeDefined();
  });

  it('PATCH /impossible-cloud/storage-accounts/:accountId → patchStorageAccount()', async () => {
    const result = await controller.patchStorageAccount('account-1', { name: 'Updated' });
    expect(result).toBeDefined();
  });

  it('GET /impossible-cloud/storage-accounts/:accountId/usage → getStorageAccountUsage()', async () => {
    const result = await controller.getStorageAccountUsage('account-1', {});
    expect(result).toBeDefined();
  });
});
