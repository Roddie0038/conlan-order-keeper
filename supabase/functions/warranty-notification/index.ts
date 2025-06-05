
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/mailer.ts";

// Email notification for warranty claims using unified mailer
serve(async (req) => {
  console.log("🚀 EDGE FUNCTION - warranty-notification called");
  
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
    console.log("📧 Processing warranty notification:", warrantyId);

    let recipients: string[] = [];
    
    // Use unified routing system via customRecipients (from getWarrantyNotificationRecipients)
    if (customRecipients && customRecipients.length > 0) {
      recipients = customRecipients;
      console.log("📧 Using unified routing system. Recipients:", recipients);
    } else {
      // Fallback to submitter email only if no recipients found
      recipients = [warrantyData.email];
      console.log("⚠️ No recipients found via unified system, using fallback:", recipients);
    }
    
    if (recipients.length === 0) {
      console.log("⚠️ No email recipients found for warranty:", warrantyData.store);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients configured for this store',
        store: warrantyData.store
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">This is an automated notification from the Conlan Tire Warranty System</p>
          <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Warranty ID: ${warrantyId}</p>
        </div>
      </div>
    `;

    console.log("📧 Sending warranty notification via mailer to:", recipients);
    
    // Send email via centralized mailer
    const emailResponse = await sendEmail({
      to: recipients,
      subject: emailSubject,
      html: emailBody
    });

    if (!emailResponse.success) {
      console.error("❌ Mailer failed:", emailResponse.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to send email: ${emailResponse.error}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("✅ Warranty notification sent successfully via mailer");

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Warranty notification sent successfully',
      recipients: recipients.length,
      store: warrantyData.store
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ Error in warranty-notification:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
