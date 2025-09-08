export const ALLOWED_DOMAIN = import.meta?.env?.VITE_ALLOWED_EMAIL_DOMAIN ?? 'conlantire.com';
export const DEFAULT_MANAGER_EMAIL = import.meta?.env?.VITE_DEFAULT_MANAGER_EMAIL ?? '';
export const ADMIN_EMAILS = (import.meta?.env?.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// Get admin emails (environment-driven only)
export const getAdminEmails = (): string[] => {
  return ADMIN_EMAILS;
};