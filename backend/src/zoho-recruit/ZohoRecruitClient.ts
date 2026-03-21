import { ZohoBaseClient } from "../base/ZohoBaseClient";
import { ZohoCredentials } from "../base/types";
import {
  RecruitJobOpening, CreateJobOpeningDTO, UpdateJobOpeningDTO,
  RecruitCandidate, CreateCandidateDTO, UpdateCandidateDTO,
  RecruitInterview, CreateInterviewDTO,
  RecruitOffer,
  RecruitListParams,
} from "./zoho-recruit.dto";
import { ZohoListWrapper, ZohoBulkResponse } from "../shared/shared.dto";

export interface ZohoRecruitConfig extends ZohoCredentials {
  organizationId?: string;
  /** Override the full API base URL. Defaults to https://recruit.zoho.com/recruit/v2 */
  apiBaseUrl?: string;
}

/**
 * Zoho Recruit v2 API client.
 * Docs: https://www.zoho.com/recruit/developer-guide/apiv2/
 */
export class ZohoRecruitClient extends ZohoBaseClient {
  constructor(config: ZohoRecruitConfig) {
    super({
      ...config,
      apiBaseUrl: config.apiBaseUrl ?? "https://recruit.zoho.com/recruit/v2",
    });
  }

  // â”€â”€â”€ Job Openings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listJobOpenings(params?: RecruitListParams): Promise<ZohoListWrapper<RecruitJobOpening>> {
    return this.get("/JobOpenings", { params });
  }
  getJobOpening(id: string): Promise<{ data: RecruitJobOpening[] }> {
    return this.get(`/JobOpenings/${id}`);
  }
  createJobOpenings(data: CreateJobOpeningDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/JobOpenings", { data });
  }
  updateJobOpenings(data: (UpdateJobOpeningDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/JobOpenings", { data });
  }
  deleteJobOpening(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/JobOpenings/${id}`);
  }

  // â”€â”€â”€ Candidates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listCandidates(params?: RecruitListParams): Promise<ZohoListWrapper<RecruitCandidate>> {
    return this.get("/Candidates", { params });
  }
  getCandidate(id: string): Promise<{ data: RecruitCandidate[] }> {
    return this.get(`/Candidates/${id}`);
  }
  createCandidates(data: CreateCandidateDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Candidates", { data });
  }
  updateCandidates(data: (UpdateCandidateDTO & { id: string })[]): Promise<ZohoBulkResponse> {
    return this.put("/Candidates", { data });
  }
  deleteCandidate(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Candidates/${id}`);
  }
  searchCandidates(params: RecruitListParams): Promise<ZohoListWrapper<RecruitCandidate>> {
    return this.get("/Candidates/search", { params });
  }

  // â”€â”€â”€ Interviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listInterviews(params?: RecruitListParams): Promise<ZohoListWrapper<RecruitInterview>> {
    return this.get("/Interviews", { params });
  }
  getInterview(id: string): Promise<{ data: RecruitInterview[] }> {
    return this.get(`/Interviews/${id}`);
  }
  createInterviews(data: CreateInterviewDTO[]): Promise<ZohoBulkResponse> {
    return this.post("/Interviews", { data });
  }
  deleteInterview(id: string): Promise<ZohoBulkResponse> {
    return this.delete(`/Interviews/${id}`);
  }

  // â”€â”€â”€ Offers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  listOffers(params?: RecruitListParams): Promise<ZohoListWrapper<RecruitOffer>> {
    return this.get("/Offers", { params });
  }
  getOffer(id: string): Promise<{ data: RecruitOffer[] }> {
    return this.get(`/Offers/${id}`);
  }
}
