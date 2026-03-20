import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
} from '@nestjs/common';
import { ZohoRecruitService } from './zoho-recruit.service';

@Controller('zoho-recruit')
export class ZohoRecruitController {
  constructor(private readonly service: ZohoRecruitService) {}

  @Get('job-openings') listJobOpenings(@Query() q: Record<string, unknown>) { return this.service.listJobOpenings(q); }
  @Get('job-openings/:id') getJobOpening(@Param('id') id: string) { return this.service.getJobOpening(id); }
  @Post('job-openings') createJobOpenings(@Body() body: { data: unknown[] }) { return this.service.createJobOpenings(body.data); }
  @Put('job-openings') updateJobOpenings(@Body() body: { data: unknown[] }) { return this.service.updateJobOpenings(body.data); }
  @Delete('job-openings/:id') deleteJobOpening(@Param('id') id: string) { return this.service.deleteJobOpening(id); }

  @Get('candidates') listCandidates(@Query() q: Record<string, unknown>) { return this.service.listCandidates(q); }
  @Get('candidates/search') searchCandidates(@Query() q: Record<string, unknown>) { return this.service.searchCandidates(q); }
  @Get('candidates/:id') getCandidate(@Param('id') id: string) { return this.service.getCandidate(id); }
  @Post('candidates') createCandidates(@Body() body: { data: unknown[] }) { return this.service.createCandidates(body.data); }
  @Put('candidates') updateCandidates(@Body() body: { data: unknown[] }) { return this.service.updateCandidates(body.data); }
  @Delete('candidates/:id') deleteCandidate(@Param('id') id: string) { return this.service.deleteCandidate(id); }

  @Get('interviews') listInterviews(@Query() q: Record<string, unknown>) { return this.service.listInterviews(q); }
  @Get('interviews/:id') getInterview(@Param('id') id: string) { return this.service.getInterview(id); }
  @Post('interviews') createInterviews(@Body() body: { data: unknown[] }) { return this.service.createInterviews(body.data); }
  @Delete('interviews/:id') deleteInterview(@Param('id') id: string) { return this.service.deleteInterview(id); }

  @Get('offers') listOffers(@Query() q: Record<string, unknown>) { return this.service.listOffers(q); }
  @Get('offers/:id') getOffer(@Param('id') id: string) { return this.service.getOffer(id); }

  // ── OAuth ────────────────────────────────────────────────────────────
  @Get('oauth/authorize') getAuthUrl(@Query('scope') scope: string) { return this.service.getAuthUrl(scope); }
  @Post('oauth/exchange') exchangeGrantCode(@Body() body: { code: string }) { return this.service.exchangeGrantCode(body.code); }
  @Post('oauth/revoke') revokeAuth() { return this.service.revokeAuth(); }
}
