// src/lib/roles.ts
export type UserLike = {
  email?: string | null;
  role?: string | null;
};

const ELEVATED_ROLES = new Set([
  'Admin',
  'Super Admin', 
  'Operations Manager',
]);

const BRAD_EMAIL = 'bperry@conlantire.com';

export function hasFullStoreAccess(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  if (email === BRAD_EMAIL) return true;
  return ELEVATED_ROLES.has(role);
}