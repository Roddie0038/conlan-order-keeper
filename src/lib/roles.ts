// src/lib/roles.ts
import { CANONICAL_ROLES, getRoleDisplayLabel, isElevatedRole } from '@/constants/roles';

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

import { getAdminEmails } from '@/config/emails';

// Use centralized admin email config
const getAdminEmail = () => {
  return getAdminEmails()[0] || 'admin@conlantire.com';
};

export function hasFullStoreAccess(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email) || ELEVATED_ROLES.has(role) || isElevatedRole(role);
}

// Re-export constants for backward compatibility
export { CANONICAL_ROLES, getRoleDisplayLabel, isElevatedRole };