// src/lib/roles.ts
export type UserLike = {
  email?: string | null;
  role?: string | null;
};

const ELEVATED_ROLES = new Set([
  'Admin',
  'Super Admin', 
  'Operations Manager',
  'super_admin',
  'admin',
  'operations_manager'
]);

const ELEVATED_EMAILS = new Set([
  'bperry@conlantire.com',
  'roderickdemarais@aol.com'
]);

export function hasFullStoreAccess(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  if (ELEVATED_EMAILS.has(email)) return true;
  return ELEVATED_ROLES.has(role);
}