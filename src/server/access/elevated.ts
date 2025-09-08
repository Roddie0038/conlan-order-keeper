// src/server/access/elevated.ts
export type UserLike = { email?: string | null; role?: string | null };

// Use centralized admin email config
const getAdminEmail = () => {
  const { getAdminEmails } = require('@/config/emails');
  return getAdminEmails()[0] || 'admin@conlantire.com';
};
const ELEVATED = new Set(['Admin', 'Super Admin', 'Operations Manager']);

export function isElevated(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  const { getAdminEmails } = require('@/config/emails');
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email) || ELEVATED.has(role);
}