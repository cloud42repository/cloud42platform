import type { UserRole } from './user.entity';

/* ── Request DTOs ── */

export interface RegisterLoginDto {
  email: string;
  name: string;
  photoUrl: string;
}

export interface SetRoleDto {
  role: UserRole;
}

export interface SetModuleVisibilityDto {
  moduleId: string;
  enabled: boolean;
}

export interface SetAllModulesDto {
  moduleIds: string[];
  enabled: boolean;
}

/* ── Response DTO (matches frontend StoredUser) ── */

export interface UserResponseDto {
  email: string;
  name: string;
  photoUrl: string;
  role: UserRole;
  moduleVisibility: Record<string, boolean>;
  createdAt: string;
  lastLoginAt: string;
}
