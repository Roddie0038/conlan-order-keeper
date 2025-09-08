// src/server/access/elevated.ts
import { getAdminEmails, DEFAULT_MANAGER_EMAIL } from '@/config/emails';

export type UserLike = { email?: string | null; role?: string | null };

const ELEVATED = new Set(['Admin', 'Super Admin', 'Operations Manager']);

export function isElevated(user?: UserLike | null): boolean {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const role = (user.role || '').trim();
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email) || ELEVATED.has(role);
}

export function getElevatedContact(): string {
  return getAdminEmails()[0] || DEFAULT_MANAGER_EMAIL || '';
}