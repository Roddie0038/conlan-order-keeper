
import { supabase } from "@/integrations/supabase/client";
import { getTransferEmailRecipients, getMTOEmailRecipients, getRefurbishedEmailRecipients, getWarrantyEmailRecipients } from "@/config/contactSystem";
import { getStoreNumberVariants, logStoreFormatTransformation } from "@/utils/storeSanitization";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";
import { roleBasedEmailService, type EmailType } from "@/services/roleBasedEmailService";

/**
 * Primary email recipient lookup using role-based email service
 */
export async function getStoreEmailRecipients(
  storeNumber: string,
  emailType: EmailType,
  plant?: string
): Promise<{
  recipients: string[];
  source: 'database' | 'fallback';
  fallbackReason?: string;
}> {
  console.log(`📧 EMAIL ROUTING - Using role-based service for store ${storeNumber}, type ${emailType}, plant ${plant}`);
  
  try {
    // Use the new role-based email service
    const result = await roleBasedEmailService.getEmailRecipients(storeNumber, emailType, plant);
    
    // Log the routing decision
    await roleBasedEmailService.logEmailRouting(
      storeNumber, 
      emailType, 
      result.recipients, 
      result.source, 
      result.fallbackReason, 
      result.routingRules
    );
    
    // Convert to the expected format
    return {
      recipients: result.recipients.map(r => r.email),
      source: result.source,
      fallbackReason: result.fallbackReason
    };
    
  } catch (error) {
    console.error(`❌ EMAIL ROUTING - Error in role-based email service:`, error);
    
    // Fallback to legacy system on error
    const fallbackResult = await getFallbackRecipients(storeNumber, emailType, 'service_error');
    return fallbackResult;
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

    // Use service role for logging to avoid RLS issues
    await supabase
      .from('notification_logs')
      .insert({
        notification_type: 'email_routing_query',
        order_id: `store-${storeNumber}-${emailType}-${Date.now()}`,
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

export async function getMTORecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'mto');
  return result.recipients;
}

export async function getWheelRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'wheel');
  return result.recipients;
}

export async function getWarrantyRecipientsDatabase(storeNumber: string): Promise<string[]> {
  const result = await getStoreEmailRecipients(storeNumber, 'warranty');
  return result.recipients;
}
