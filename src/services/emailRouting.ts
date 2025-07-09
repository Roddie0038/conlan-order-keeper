import { supabase } from "@/integrations/supabase/client";
import { getTransferEmailRecipients, getMTOEmailRecipients, getRefurbishedEmailRecipients, getWarrantyEmailRecipients } from "@/config/contactSystem";

export type EmailType = 'transfer' | 'mto' | 'wheel' | 'warranty' | 'completion';

/**
 * Get store email recipients from the centralized store_email_recipients table
 * Filtered by platform_source = 'ordering_platform'
 */
export async function getStoreEmailRecipients(
  storeNumber: string,
  emailType: EmailType
): Promise<{
  recipients: string[];
  source: 'database' | 'fallback';
  fallbackReason?: string;
}> {
  try {
    console.log(`📧 EMAIL ROUTING - Querying database for store ${storeNumber}, type ${emailType}`);
    
    const { data, error } = await supabase
      .from('store_email_recipients')
      .select('recipient_email')
      .eq('store_number', storeNumber)
      .eq('email_type', emailType)
      .eq('is_active', true)
      .eq('platform_source', 'ordering_platform');

    if (error) {
      console.error('📧 EMAIL ROUTING - Database query error:', error);
      return await getFallbackRecipients(storeNumber, emailType, 'database_error');
    }

    const recipients = data?.map(row => row.recipient_email) || [];
    
    if (recipients.length === 0) {
      console.log(`📧 EMAIL ROUTING - No database recipients found for store ${storeNumber}, type ${emailType}, using fallback`);
      return await getFallbackRecipients(storeNumber, emailType, 'no_recipients');
    }

    console.log(`📧 EMAIL ROUTING - Found ${recipients.length} database recipients:`, recipients);
    
    // Log the database-driven routing
    await logEmailRouting(storeNumber, emailType, recipients, 'database');
    
    return {
      recipients,
      source: 'database'
    };
  } catch (error) {
    console.error('📧 EMAIL ROUTING - Unexpected error:', error);
    return await getFallbackRecipients(storeNumber, emailType, 'exception');
  }
}

/**
 * Fallback to legacy contactSystem functions if database query fails or returns no results
 */
async function getFallbackRecipients(
  storeNumber: string, 
  emailType: EmailType,
  reason: string
): Promise<{
  recipients: string[];
  source: 'database' | 'fallback';
  fallbackReason: string;
}> {
  console.log(`📧 EMAIL ROUTING - Using fallback for store ${storeNumber}, type ${emailType}, reason: ${reason}`);
  
  let recipients: string[] = [];
  
  switch (emailType) {
    case 'transfer':
      recipients = getTransferEmailRecipients(storeNumber);
      break;
    case 'mto':
      recipients = getMTOEmailRecipients(storeNumber);
      break;
    case 'wheel':
      recipients = getRefurbishedEmailRecipients(storeNumber);
      break;
    case 'warranty':
      recipients = getWarrantyEmailRecipients(storeNumber);
      break;
    case 'completion':
      // For completion emails, use transfer recipients as default
      recipients = getTransferEmailRecipients(storeNumber);
      break;
    default:
      console.warn(`📧 EMAIL ROUTING - Unknown email type: ${emailType}`);
      recipients = [];
  }
  
  console.log(`📧 EMAIL ROUTING - Fallback returned ${recipients.length} recipients:`, recipients);
  
  // Log the fallback usage
  await logEmailRouting(storeNumber, emailType, recipients, 'fallback', reason);
  
  return {
    recipients,
    source: 'fallback',
    fallbackReason: reason
  };
}

/**
 * Log email routing to notification_logs for monitoring and debugging
 */
async function logEmailRouting(
  storeNumber: string,
  emailType: EmailType,
  recipients: string[],
  source: 'database' | 'fallback',
  fallbackReason?: string
): Promise<void> {
  try {
    const metadata = {
      routing_source: source,
      email_type: emailType,
      store_number: storeNumber,
      recipient_count: recipients.length,
      recipients: recipients,
      platform_source: 'ordering_platform',
      ...(fallbackReason && { fallback_reason: fallbackReason })
    };

    await supabase
      .from('notification_logs')
      .insert({
        notification_type: 'email_routing_query',
        order_id: `store-${storeNumber}-${emailType}-${Date.now()}`, // Unique identifier
        recipient_email: recipients.join(', ') || 'none',
        status: 'success',
        platform: 'ordering_platform',
        order_type: emailType,
        store: storeNumber,
        email_provider: 'resend',
        metadata
      });
      
    console.log(`📧 EMAIL ROUTING - Logged routing query: ${source} source, ${recipients.length} recipients`);
  } catch (error) {
    console.error('📧 EMAIL ROUTING - Failed to log routing:', error);
    // Don't throw - logging failures shouldn't block email sending
  }
}

/**
 * Get email recipients for transfer orders (legacy wrapper for backward compatibility)
 * @deprecated Use getStoreEmailRecipients(storeNumber, 'transfer') instead
 */
export async function getTransferRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'transfer');
  return result.recipients;
}

/**
 * Get email recipients for MTO orders (legacy wrapper for backward compatibility)
 * @deprecated Use getStoreEmailRecipients(storeNumber, 'mto') instead
 */
export async function getMTORecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'mto');
  return result.recipients;
}

/**
 * Get email recipients for wheel orders (legacy wrapper for backward compatibility)
 * @deprecated Use getStoreEmailRecipients(storeNumber, 'wheel') instead
 */
export async function getWheelRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'wheel');
  return result.recipients;
}

/**
 * Get email recipients for warranty orders (legacy wrapper for backward compatibility)
 * @deprecated Use getStoreEmailRecipients(storeNumber, 'warranty') instead
 */
export async function getWarrantyRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'warranty');
  return result.recipients;
}