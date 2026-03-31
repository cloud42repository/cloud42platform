import type { DashboardStatus } from './dashboard.entity';

/* ── Request DTOs ── */

/** POST /api/dashboards — create a new dashboard */
export interface CreateDashboardDto {
  id?: string;
  userEmail: string;
  name: string;
  description?: string;
  widgets: unknown[];
  status?: DashboardStatus;
}

/** PUT /api/dashboards/:id — full update */
export interface UpdateDashboardDto {
  name?: string;
  description?: string;
  widgets?: unknown[];
  status?: DashboardStatus;
}

/* ── Response DTO ── */

export interface DashboardResponseDto {
  id: string;
  userEmail: string;
  name: string;
  description: string;
  widgets: unknown[];
  status: DashboardStatus;
  createdAt: string;
  updatedAt: string;
}
