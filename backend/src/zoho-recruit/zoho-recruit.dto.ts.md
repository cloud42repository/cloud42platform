# zoho-recruit.dto.ts

TypeScript type definitions and interfaces for the Zoho Recruit integration, covering job openings, candidates, interviews, offers, and list query parameters.

## Key Exports

- **JobStatus** — Type union: `"open" | "on_hold" | "cancelled" | "filled"`
- **RecruitJobOpening** — Interface for job opening records (with dynamic fields via index signature)
- **CreateJobOpeningDTO** / **UpdateJobOpeningDTO** — DTOs for job opening CRUD
- **CandidateStatus** — Type union: `"new" | "in_review" | "available" | "engaged" | "offered" | "hired" | "rejected"`
- **RecruitCandidate** — Interface for candidate records with skills, salary, location, and dynamic fields
- **CreateCandidateDTO** / **UpdateCandidateDTO** — DTOs for candidate CRUD
- **InterviewStatus** — Type union: `"rejected" | "hired" | "in_review" | "pending"`
- **RecruitInterview** — Interface for interview records
- **CreateInterviewDTO** — DTO for scheduling interviews
- **RecruitOffer** — Interface for offer records
- **RecruitListParams** — Extended list params with status, cvid, and search filters

## Dependencies

- `ZohoAddress`, `ZohoListParams` from `../shared/shared.dto`

## How It Works

Provides a complete type model for Zoho Recruit v2 API resources. Interfaces use index signatures for extensibility since Recruit supports custom fields. DTOs enforce required fields (e.g., `Last_Name` for candidates, `Job_Opening_Name` for openings). `RecruitListParams` extends shared pagination with recruitment-specific search capabilities.
