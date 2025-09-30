import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/mailer.ts";

// Initialize Supabase client for database queries
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Normalize store number from various formats
 */
function normalizeStoreNumber(store: string): string {
  if (!store) return '';
  
  // If it's already just a number
  if (/^\d+$/.test(store.trim())) {
    return store.trim().replace(/^0+/, '') || '0'; // Remove leading zeros
  }
  
  // Extract number from store name like "Fort Worth 22"
  const match = store.match(/\d+/);
  return match ? match[0] : '';
}

/**
 * Get email recipients for warranty orders from store_email_recipients table
 * NO hardcoded emails - uses database only
 */
async function getWarrantyOrderRecipients(storeNumber: string): Promise<string[]> {
  if (!storeNumber) {
    console.warn('⚠️ WARRANTY NOTIFICATION - No store number provided');
    return [];
  }

  console.log(`🔍 WARRANTY NOTIFICATION - Looking up recipients for store ${storeNumber}`);

  try {
    // Query store_email_recipients table for warranty order recipients
    const { data: storeRecipients, error: storeError } = await supabase
      .from('store_email_recipients')
      .select('recipient_email, recipient_role, store_number, store_name')
      .eq('store_number', storeNumber)
      .eq('email_type', 'warranty')
      .eq('is_active', true);

    if (storeError) {
      console.error('❌ WARRANTY NOTIFICATION - Error querying store_email_recipients:', storeError);
    } else if (storeRecipients && storeRecipients.length > 0) {
      const emails = storeRecipients.map(r => r.recipient_email);
      console.log(`✅ WARRANTY NOTIFICATION - Found ${emails.length} recipients from store_email_recipients:`, 
        storeRecipients.map(r => ({ email: r.recipient_email, role: r.recipient_role })));
      return emails;
    }

    // Fallback: Query platform_users for active users assigned to this store
    console.log(`⚠️ WARRANTY NOTIFICATION - No recipients in store_email_recipients for store ${storeNumber}, checking platform_users...`);
    
    const { data: platformUsers, error: platformError } = await supabase
      .from('platform_users')
      .select('email, role, store')
      .eq('platform', 'ordering_platform')
      .eq('status', 'active')
      .eq('store', storeNumber)
      .in('role', ['store_manager', 'service_manager', 'warehouse_staff', 'team_lead']);

    if (platformError) {
      console.error('❌ WARRANTY NOTIFICATION - Error querying platform_users:', platformError);
      return [];
    }

    if (platformUsers && platformUsers.length > 0) {
      const emails = platformUsers.map(u => u.email);
      console.log(`✅ WARRANTY NOTIFICATION - Found ${emails.length} recipients from platform_users:`, 
        platformUsers.map(u => ({ email: u.email, role: u.role })));
      return emails;
    }

    console.log(`❌ WARRANTY NOTIFICATION - No recipients found for store ${storeNumber}`);
    return [];

  } catch (error) {
    console.error('❌ WARRANTY NOTIFICATION - Error getting recipients:', error);
    return [];
  }
}

// Email notification for warranty claims with database-driven recipient routing
serve(async (req) => {
  console.log("🚀 WARRANTY NOTIFICATION - Edge function called");
  console.log("🚀 WARRANTY NOTIFICATION - Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { warrantyData, warrantyId, customRecipients } = await req.json();
    console.log("📧 WARRANTY NOTIFICATION - Processing warranty:", warrantyId);
    console.log("📧 WARRANTY NOTIFICATION - Warranty data:", warrantyData);

    // Extract store number from store name
    const storeNumber = normalizeStoreNumber(warrantyData.store || '');
    console.log("📧 WARRANTY NOTIFICATION - Extracted store number:", storeNumber);
    
    // Get recipients from database (NO hardcoded fallbacks)
    let recipients = customRecipients;
    if (!recipients || recipients.length === 0) {
      recipients = await getWarrantyOrderRecipients(storeNumber);
    }
    
    if (!recipients || recipients.length === 0) {
      console.log("⚠️ WARRANTY NOTIFICATION - No email recipients found in database for warranty:", warrantyId);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients found in database',
        store: warrantyData.store,
        storeNumber: storeNumber,
        warrantyId: warrantyId,
        source: 'database_query'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)];
    console.log("📧 WARRANTY NOTIFICATION - Final recipient list from database:", uniqueRecipients);

    const emailSubject = `Retread Warranty Claim - ${warrantyData.customer_name} - ${warrantyData.work_order}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🔧 Retread Warranty Claim</h1>
        </div>
        
        <div style="padding: 30px;">
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;">
            <h2 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">New Warranty Claim Submitted</h2>
            <p style="margin: 0; font-weight: bold;">Customer: ${warrantyData.customer_name}</p>
            <p style="margin: 5px 0 0 0; font-weight: bold;">Work Order: ${warrantyData.work_order}</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Store Information</h3>
            <p><strong>Store:</strong> ${warrantyData.store}</p>
            <p><strong>Plant:</strong> ${warrantyData.plant}</p>
            <p><strong>Submitted By:</strong> ${warrantyData.name} (${warrantyData.email})</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Tire Details</h3>
            <p><strong>DOT Number:</strong> ${warrantyData.dot_number}</p>
            <p><strong>Tire Size:</strong> ${warrantyData.tire_size || 'Not specified'}</p>
            <p><strong>Condition/Reason:</strong> ${warrantyData.condition}</p>
            ${warrantyData.notes ? `<p><strong>Notes:</strong> ${warrantyData.notes}</p>` : ''}
          </div>

          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Attachments</h3>
            <p><strong>Invoice:</strong> <a href="${warrantyData.invoice_url}" style="color: #2563eb; text-decoration: underline;">View Invoice</a></p>
            
            ${warrantyData.photo_urls && warrantyData.photo_urls.length > 0 ? `
              <p><strong>Tire Photos:</strong></p>
              <ul style="list-style-type: disc; margin-left: 20px;">
                ${warrantyData.photo_urls.map((url: string, index: number) => 
                  `<li><a href="${url}" style="color: #2563eb; text-decoration: underline;">Photo ${index + 1}</a></li>`
                ).join('')}
              </ul>
            ` : '<p><strong>Tire Photos:</strong> None uploaded</p>'}
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f0f9ff; border-radius: 6px; border: 1px solid #0ea5e9;">
            <p style="margin: 0; color: #0c4a6e; font-weight: bold;">⚡ Action Required</p>
            <p style="margin: 5px 0 0 0; color: #075985;">Please review this warranty claim and process within 2 weeks as per Local Book policy. Contact the submitter directly if additional information is needed.</p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #e8f5e8; border-radius: 6px; border: 1px solid #10b981;">
            <p style="margin: 0; color: #047857; font-size: 14px;">📧 Recipients pulled from database for store ${storeNumber}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">This is an automated notification from the Conlan Tire Warranty System</p>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Warranty ID: ${warrantyId}</p>
        </div>
      </div>
    `;

    console.log("📧 WARRANTY NOTIFICATION - Sending email via database routing to:", uniqueRecipients);
    console.log("📧 WARRANTY NOTIFICATION - Email subject:", emailSubject);
    
    // Send email via centralized mailer
    const emailResponse = await sendEmail({
      to: uniqueRecipients as string[],
      subject: emailSubject,
      html: emailBody
    });

    if (!emailResponse.success) {
      console.error("❌ WARRANTY NOTIFICATION - Email sending failed:", emailResponse.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to send email: ${emailResponse.error}`,
        store: warrantyData.store,
        storeNumber: storeNumber
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("✅ WARRANTY NOTIFICATION - Email sent successfully via database routing");

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Warranty notification sent successfully via database routing',
      recipients: uniqueRecipients.length,
      store: warrantyData.store,
      storeNumber: storeNumber,
      warrantyId: warrantyId,
      finalRecipients: uniqueRecipients,
      source: 'database_query'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ WARRANTY NOTIFICATION - Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});