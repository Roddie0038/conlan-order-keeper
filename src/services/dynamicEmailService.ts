// DEPRECATED: Email routing is now handled by OT platform
// This file is retained for backward compatibility but should not be used
// All email routing queries should be removed from Ordering platform

export interface EmailRecipient {
  email: string;
  role: string;
  store: string;
  source: 'deprecated';
}

export type EmailType = 'transfer' | 'mto' | 'warranty' | 'wheel' | 'out_of_stock' | 'completion' | 'cross_dock' | 'message';

/**
 * @deprecated DO NOT USE - Email routing is handled by OT platform
 * This function returns empty array as Ordering should not query routing tables
 */
export async function getOrderingEmailRecipients(store: string, emailType: EmailType): Promise<EmailRecipient[]> {
  console.warn('⚠️ DEPRECATED: getOrderingEmailRecipients() should not be used. Email routing is handled by OT platform.');
  console.warn('⚠️ Ordering platform does not access store_email_recipients or platform_users tables.');
  return [];
}

/**
 * @deprecated DO NOT USE - Email routing is handled by OT platform
 */
export async function getStoreEmailRecipients(store: string): Promise<EmailRecipient[]> {
  console.warn('⚠️ DEPRECATED: getStoreEmailRecipients() should not be used. Email routing is handled by OT platform.');
  return [];
}

/**
 * @deprecated DO NOT USE - Email routing is handled by OT platform
 */
export async function getManagerEmail(store: string): Promise<string> {
  console.warn('⚠️ DEPRECATED: getManagerEmail() should not be used. Email routing is handled by OT platform.');
  return '';
}

/**
 * @deprecated DO NOT USE - Email routing is handled by OT platform
 */
export async function getFirstManagerEmail(store: string): Promise<string> {
  console.warn('⚠️ DEPRECATED: getFirstManagerEmail() should not be used. Email routing is handled by OT platform.');
  return '';
}

export function normalizeStoreNumber(store: string): string {
  if (!store) return '';
  if (/^\d+$/.test(store.trim())) {
    return store.trim().replace(/^0+/, '') || '0';
  }
  const match = store.match(/\d+/);
  return match ? match[0] : '';
}
