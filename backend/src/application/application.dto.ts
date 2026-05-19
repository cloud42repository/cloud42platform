import type { ApplicationStatus } from './application.entity';

/* ── Request DTOs ── */

/** POST /api/applications — create a new application */
export interface CreateApplicationDto {
  id?: string;
  userEmail: string;
  name: string;
  description?: string;
  pages?: unknown[];
  navigation?: unknown;
  context?: Record<string, unknown>;
  status?: ApplicationStatus;
}

/** PUT /api/applications/:id — full update */
export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  pages?: unknown[];
  navigation?: unknown;
  context?: Record<string, unknown>;
  status?: ApplicationStatus;
}

/* ── Response DTO ── */

export interface ApplicationResponseDto {
  id: string;
  userEmail: string;
  name: string;
  description: string;
  pages: unknown[];
  navigation: unknown;
  context: Record<string, unknown>;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
