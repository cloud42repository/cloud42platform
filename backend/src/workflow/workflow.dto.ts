import type { WorkflowStatus } from './workflow.entity';

/* ── Request DTOs ── */

/** POST /api/workflows — create a new workflow */
export interface CreateWorkflowDto {
  id?: string;               // optional client-generated ID
  userEmail: string;
  name: string;
  description?: string;
  steps: unknown[];
  inputs?: unknown[];
  outputs?: unknown[];
  status?: WorkflowStatus;
  scheduledAt?: string | null;
}

/** PUT /api/workflows/:id — full update */
export interface UpdateWorkflowDto {
  name?: string;
  description?: string;
  steps?: unknown[];
  inputs?: unknown[];
  outputs?: unknown[];
  status?: WorkflowStatus;
  scheduledAt?: string | null;
  lastRunLog?: unknown | null;
}

/* ── Response DTO ── */

export interface WorkflowResponseDto {
  id: string;
  userEmail: string;
  name: string;
  description: string;
  steps: unknown[];
  inputs: unknown[];
  outputs: unknown[];
  status: WorkflowStatus;
  scheduledAt: string | null;
  lastRunLog: unknown | null;
  createdAt: string;
  updatedAt: string;
}
