import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { ZohoRecruitController } from '../../zoho-recruit/zoho-recruit.controller';

describe('ZohoRecruitController (e2e)', () => {
  let moduleFixture: TestingModule;
  let controller: ZohoRecruitController;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        {
          module: AppModule,
        },
      ],
    }).compile();

    controller = moduleFixture.get<ZohoRecruitController>(ZohoRecruitController);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Job Openings ---
  it('GET /zoho-recruit/job-openings → listJobOpenings()', async () => {
    const result = await controller.listJobOpenings({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-recruit/job-openings/:id → getJobOpening()', async () => {
    const result = await controller.getJobOpening('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-recruit/job-openings → createJobOpenings()', async () => {
    const result = await controller.createJobOpenings({ data: [{ Posting_Title: 'Dev', Client_Name: 'TestCo' }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-recruit/job-openings → updateJobOpenings()', async () => {
    const result = await controller.updateJobOpenings({ data: [{ id: '000000000000001', Posting_Title: 'Updated' }] });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-recruit/job-openings/:id → deleteJobOpening()', async () => {
    const result = await controller.deleteJobOpening('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Candidates ---
  it('GET /zoho-recruit/candidates → listCandidates()', async () => {
    const result = await controller.listCandidates({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-recruit/candidates/search → searchCandidates()', async () => {
    const result = await controller.searchCandidates({ criteria: '(Last_Name:equals:Test)' });
    expect(result).toBeDefined();
  });

  it('GET /zoho-recruit/candidates/:id → getCandidate()', async () => {
    const result = await controller.getCandidate('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-recruit/candidates → createCandidates()', async () => {
    const result = await controller.createCandidates({ data: [{ Last_Name: 'Test', Email: 'test@test.com' }] });
    expect(result).toBeDefined();
  });

  it('PUT /zoho-recruit/candidates → updateCandidates()', async () => {
    const result = await controller.updateCandidates({ data: [{ id: '000000000000001', Last_Name: 'Updated' }] });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-recruit/candidates/:id → deleteCandidate()', async () => {
    const result = await controller.deleteCandidate('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Interviews ---
  it('GET /zoho-recruit/interviews → listInterviews()', async () => {
    const result = await controller.listInterviews({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-recruit/interviews/:id → getInterview()', async () => {
    const result = await controller.getInterview('000000000000001');
    expect(result).toBeDefined();
  });

  it('POST /zoho-recruit/interviews → createInterviews()', async () => {
    const result = await controller.createInterviews({ data: [{ Interview_Name: 'Screen Call' }] });
    expect(result).toBeDefined();
  });

  it('DELETE /zoho-recruit/interviews/:id → deleteInterview()', async () => {
    const result = await controller.deleteInterview('000000000000001');
    expect(result).toBeDefined();
  });

  // --- Offers ---
  it('GET /zoho-recruit/offers → listOffers()', async () => {
    const result = await controller.listOffers({});
    expect(result).toBeDefined();
  });

  it('GET /zoho-recruit/offers/:id → getOffer()', async () => {
    const result = await controller.getOffer('000000000000001');
    expect(result).toBeDefined();
  });
});
