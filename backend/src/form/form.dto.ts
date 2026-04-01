import type { FormStatus } from './form.entity';

/* ── Request DTOs ── */

/** POST /api/forms — create a new form */
export interface CreateFormDto {
  id?: string;
  userEmail: string;
  name: string;
  description?: string;
  fields: unknown[];
  submitActions?: unknown[];
  status?: FormStatus;
}

/** PUT /api/forms/:id — full update */
export interface UpdateFormDto {
  name?: string;
  description?: string;
  fields?: unknown[];
  submitActions?: unknown[];
  status?: FormStatus;
}

/* ── Response DTO ── */

export interface FormResponseDto {
  id: string;
  userEmail: string;
  name: string;
  description: string;
  fields: unknown[];
  submitActions: unknown[];
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
}
