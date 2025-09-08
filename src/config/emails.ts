export const ALLOWED_DOMAIN = import.meta?.env?.VITE_ALLOWED_EMAIL_DOMAIN ?? 'conlantire.com';
export const DEFAULT_MANAGER_EMAIL = import.meta?.env?.VITE_DEFAULT_MANAGER_EMAIL ?? '';
export const ADMIN_EMAILS = (import.meta?.env?.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Fallback admin emails if none provided via env
export const FALLBACK_ADMIN_EMAILS = [
  'conlan97@conlantire.com',
  'admin@conlantire.com'
];

// Get admin emails with fallback
export const getAdminEmails = (): string[] => {
  return ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : FALLBACK_ADMIN_EMAILS;
};