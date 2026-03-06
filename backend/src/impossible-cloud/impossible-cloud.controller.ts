import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ImpossibleCloudService } from './impossible-cloud.service';

@Controller('impossible-cloud')
export class ImpossibleCloudController {
  constructor(private readonly service: ImpossibleCloudService) {}

  // Integrations
  @Get('regions')
  listRegions() { return this.service.listRegions(); }

  // Contracts
  @Get('contracts')
  listContracts() { return this.service.listContracts(); }

  @Get('contracts/:contractId/partners')
  listContractPartners(@Param('contractId') contractId: string) { return this.service.listContractPartners(contractId); }

  // Partners
  @Post('partners')
  createPartner(@Body() data: unknown) { return this.service.createPartner(data); }

  @Get('partners/:partnerId')
  getPartner(@Param('partnerId') partnerId: string) { return this.service.getPartner(partnerId); }

  @Put('partners/:partnerId')
  updatePartner(@Param('partnerId') partnerId: string, @Body() data: unknown) { return this.service.updatePartner(partnerId, data); }

  @Delete('partners/:partnerId')
  deletePartner(@Param('partnerId') partnerId: string) { return this.service.deletePartner(partnerId); }

  // Members
  @Get('partners/:partnerId/members')
  listMembers(@Param('partnerId') partnerId: string) { return this.service.listMembers(partnerId); }

  @Post('partners/:partnerId/members')
  createMember(@Param('partnerId') partnerId: string, @Body() data: unknown) { return this.service.createMember(partnerId, data); }

  @Delete('partners/:partnerId/members/:memberId')
  deleteMember(@Param('partnerId') partnerId: string, @Param('memberId') memberId: string) { return this.service.deleteMember(partnerId, memberId); }

  // Partner Storage Accounts
  @Get('partners/:partnerId/storage-accounts')
  listPartnerStorageAccounts(@Param('partnerId') partnerId: string) { return this.service.listPartnerStorageAccounts(partnerId); }

  @Post('partners/:partnerId/storage-accounts')
  createPartnerStorageAccount(@Param('partnerId') partnerId: string, @Body() data: unknown) { return this.service.createPartnerStorageAccount(partnerId, data); }

  @Get('partners/:partnerId/storage-accounts/:accountId')
  getPartnerStorageAccount(@Param('partnerId') partnerId: string, @Param('accountId') accountId: string) { return this.service.getPartnerStorageAccount(partnerId, accountId); }

  @Delete('partners/:partnerId/storage-accounts/:accountId')
  deletePartnerStorageAccount(@Param('partnerId') partnerId: string, @Param('accountId') accountId: string) { return this.service.deletePartnerStorageAccount(partnerId, accountId); }

  @Patch('partners/:partnerId/storage-accounts/:accountId')
  patchPartnerStorageAccount(@Param('partnerId') partnerId: string, @Param('accountId') accountId: string, @Body() data: unknown) { return this.service.patchPartnerStorageAccount(partnerId, accountId, data); }

  @Get('partners/:partnerId/storage-accounts/:accountId/usage')
  getPartnerStorageAccountUsage(
    @Param('partnerId') partnerId: string,
    @Param('accountId') accountId: string,
    @Query() params: Record<string, unknown>,
  ) { return this.service.getPartnerStorageAccountUsage(partnerId, accountId, params); }

  @Get('partners/:partnerId/usage')
  getPartnerUsage(@Param('partnerId') partnerId: string, @Query() params: Record<string, unknown>) { return this.service.getPartnerUsage(partnerId, params); }

  // Own Storage Accounts
  @Post('storage-accounts')
  createStorageAccount(@Body() data: unknown) { return this.service.createStorageAccount(data); }

  @Get('storage-accounts')
  listStorageAccounts() { return this.service.listStorageAccounts(); }

  @Get('storage-accounts/usage')
  getAllStorageAccountsUsage(@Query() params: Record<string, unknown>) { return this.service.getAllStorageAccountsUsage(params); }

  @Get('storage-accounts/:accountId')
  getStorageAccount(@Param('accountId') accountId: string) { return this.service.getStorageAccount(accountId); }

  @Delete('storage-accounts/:accountId')
  deleteStorageAccount(@Param('accountId') accountId: string) { return this.service.deleteStorageAccount(accountId); }

  @Patch('storage-accounts/:accountId')
  patchStorageAccount(@Param('accountId') accountId: string, @Body() data: unknown) { return this.service.patchStorageAccount(accountId, data); }

  @Get('storage-accounts/:accountId/usage')
  getStorageAccountUsage(@Param('accountId') accountId: string, @Query() params: Record<string, unknown>) { return this.service.getStorageAccountUsage(accountId, params); }
}
