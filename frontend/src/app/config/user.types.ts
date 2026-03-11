/** User roles in the platform */
export type UserRole = 'admin' | 'manager' | 'user';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  user: 'User',
};

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full access – can manage users, roles, and all module visibility settings',
  manager: 'Can configure own module visibility but cannot manage other users',
  user: 'Read-only access to modules assigned by an Admin',
};

/** Stored user profile with role and module permissions */
export interface StoredUser {
  email: string;
  name: string;
  photoUrl: string;
  role: UserRole;
  /** Per-module visibility: moduleId → enabled.  Missing = use role default. */
  moduleVisibility: Record<string, boolean>;
  /** ISO date string of first login */
  createdAt: string;
  /** ISO date string of the most recent login */
  lastLoginAt: string;
}
