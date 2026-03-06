import { ZohoAddress, ZohoListParams } from "../shared/shared.dto";

// â”€â”€â”€ Job Opening â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type JobStatus = "open" | "on_hold" | "cancelled" | "filled";

export interface RecruitJobOpening {
  Job_Opening_ID?: string;
  Job_Opening_Name?: string;
  Department?: string;
  Location?: string;
  No_of_Positions?: number;
  Job_Opening_Status?: JobStatus;
  Required_Skills?: string;
  Date_Opened?: string;
  Target_Date?: string;
  Hiring_Manager?: string;
  Assigned_Recruiters?: string[];
  [key: string]: unknown;
}

export interface CreateJobOpeningDTO {
  Job_Opening_Name: string;
  Department?: string;
  No_of_Positions?: number;
  Location?: string;
  Required_Skills?: string;
  Target_Date?: string;
  [key: string]: unknown;
}

export type UpdateJobOpeningDTO = Partial<CreateJobOpeningDTO>;

// â”€â”€â”€ Candidate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CandidateStatus = "new" | "in_review" | "available" | "engaged" | "offered" | "hired" | "rejected";

export interface RecruitCandidate {
  Candidate_ID?: string;
  First_Name?: string;
  Last_Name?: string;
  Email?: string;
  Mobile?: string;
  Current_Job_Title?: string;
  Current_Employer?: string;
  Candidate_Status?: CandidateStatus;
  Experience_in_Years?: number;
  Skill_Set?: string;
  Highest_Qualification_Held?: string;
  Current_Salary?: number;
  Expected_Salary?: number;
  City?: string;
  State?: string;
  Country?: string;
  [key: string]: unknown;
}

export interface CreateCandidateDTO {
  Last_Name: string;
  First_Name?: string;
  Email?: string;
  Mobile?: string;
  Current_Job_Title?: string;
  Current_Employer?: string;
  [key: string]: unknown;
}

export type UpdateCandidateDTO = Partial<CreateCandidateDTO>;

// â”€â”€â”€ Interview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type InterviewStatus = "rejected" | "hired" | "in_review" | "pending";

export interface RecruitInterview {
  Interview_ID?: string;
  Candidate_ID?: string;
  Job_Opening_ID?: string;
  Name?: string;
  Interview_Time?: string;
  Interviewers?: { id: string; name?: string }[];
  Status?: InterviewStatus;
  Notes?: string;
}

export interface CreateInterviewDTO {
  Candidate_ID: string;
  Job_Opening_ID: string;
  Name?: string;
  Interview_Time?: string;
  Interviewers?: string[];
  Notes?: string;
}

// â”€â”€â”€ Offer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RecruitOffer {
  Offer_ID?: string;
  Candidate_ID?: string;
  Job_Opening_ID?: string;
  Offer_Amount?: number;
  Date_of_Joining?: string;
  Status?: "pending" | "accepted" | "rejected";
}

// â”€â”€â”€ List params â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface RecruitListParams extends ZohoListParams {
  status?: string;
  cvid?: string;
  searchColumn?: string;
  searchValue?: string;
}
