// src/server/access/elevated.ts
export type UserLike = { email?: string | null; role?: string | null };

const BRAD = 'bperry@conlantire.com';
const ELEVATED = new Set(['Admin', 'Super Admin', 'Operations Manager']);

export function isElevated(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  if (email === BRAD) return true;
  return ELEVATED.has(role);
}