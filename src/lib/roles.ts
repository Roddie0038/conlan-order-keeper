// src/lib/roles.ts
import { CANONICAL_ROLES, getRoleDisplayLabel, isElevatedRole } from '@/constants/roles';
import { getAdminEmails, DEFAULT_MANAGER_EMAIL } from '@/config/emails';

export type UserLike = {
  email?: string | null;
  role?: string | null;
};

const ELEVATED_ROLES = new Set([
  'Admin',
  'Super Admin', 
  'Operations Manager',
  'super_admin',
  'operations_manager',
  'plant_manager',
  'plant_admin', // Legacy
  'warehouse_manager'
]);

// Check if email is in admin list
export function isAdminEmail(email: string): boolean {
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.trim().toLowerCase());
}

// Get fallback admin email
export function getFallbackAdminEmail(): string {
  return getAdminEmails()[0] || DEFAULT_MANAGER_EMAIL || '';
}

export function hasFullStoreAccess(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email) || ELEVATED_ROLES.has(role) || isElevatedRole(role);
}

// Re-export constants for backward compatibility
export { CANONICAL_ROLES, getRoleDisplayLabel, isElevatedRole };