import type { UserRole, UserStatus } from './user.entity';

/* ── Request DTOs ── */

export interface RegisterLoginDto {
  email: string;
  name: string;
  photoUrl: string;
}

/** POST /api/users/register — self-registration (public) */
export interface RegisterDto {
  email: string;
  name: string;
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

/** POST /api/users/:email/set-password — set password with token */
export interface SetPasswordDto {
  token: string;
  password: string;
}

/** POST /api/auth/password-login — email + password login */
export interface PasswordLoginDto {
  email: string;
  password: string;
}

/* ── Response DTO (matches frontend StoredUser) ── */

export interface UserResponseDto {
  email: string;
  name: string;
  photoUrl: string;
  role: UserRole;
  status: UserStatus;
  moduleVisibility: Record<string, boolean>;
  createdAt: string;
  lastLoginAt: string;
}
