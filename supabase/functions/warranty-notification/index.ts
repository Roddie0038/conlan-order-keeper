
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { sendEmail } from "../_shared/mailer.ts";

// Plant Manager mapping by plant code
const PLANT_MANAGER_MAP: Record<string, string> = {
  '97': 'gsumodobila@conlantire.com', // Gabriel Sumodobila - Grand Prairie
  '98': 'bperry@conlantire.com',      // Brody Perry - Romulus  
  '99': 'dlee@conlantire.com',        // David Lee - Mulberry
};

// Active Retread Managers (all plants)
const RETREAD_MANAGERS = [
  'jesquivel@conlantire.com',  // Jesus Esquivel - Grand Prairie
  'jpalos@conlantire.com',     // John Palos - Grand Prairie
  'wsettles@conlantire.com',   // Wayne Settles - Mulberry
  'cperez@conlantire.com',     // Carlos Perez - Mulberry
  'chynds@conlantire.com',     // Cameron Hynds - Romulus
];

// Function to determine plant code from store number
function getPlantCodeFromStore(storeNumber: string): string {
  const storeNum = parseInt(storeNumber);
  
  if (storeNum >= 22 && storeNum <= 39) {
    return "97"; // Grand Prairie plant
  } else if ([1, 2, 3, 4, 5, 6, 7, 9, 15, 23, 40].includes(storeNum)) {
    return "99"; // Mulberry plant
  } else if (storeNum >= 8 && storeNum <= 18) {
    return "98"; // Romulus plant
  }
  
  // Default fallback to Grand Prairie
  return "97";
}

// Email notification for warranty claims with correct recipient routing
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

    // Build recipient list for WARRANTY TIRE ORDERS ONLY
    const recipients: string[] = [];
    
    // Extract store number from store name
    const storeNumber = warrantyData.store.match(/\d+$/)?.[0] || "";
    console.log("📧 WARRANTY NOTIFICATION - Store number:", storeNumber);
    
    if (storeNumber) {
      // 1. Always include Brad Perry for WARRANTY orders
      recipients.push('bperry@conlantire.com');
      console.log("📧 WARRANTY NOTIFICATION - Added Brad Perry for warranty order");
      
      // 2. Include all Retread Managers
      recipients.push(...RETREAD_MANAGERS);
      console.log("📧 WARRANTY NOTIFICATION - Added retread managers:", RETREAD_MANAGERS);
      
      // 3. Determine and add Plant Manager based on store's plant
      const plantCode = getPlantCodeFromStore(storeNumber);
      const plantManagerEmail = PLANT_MANAGER_MAP[plantCode];
      
      if (plantManagerEmail && !recipients.includes(plantManagerEmail)) {
        recipients.push(plantManagerEmail);
        console.log("📧 WARRANTY NOTIFICATION - Added plant manager:", plantManagerEmail, "for plant:", plantCode);
      }
      
      // 4. Add submitting store manager
      if (warrantyData.email && !recipients.includes(warrantyData.email)) {
        recipients.push(warrantyData.email);
        console.log("📧 WARRANTY NOTIFICATION - Added submitting store manager:", warrantyData.email);
      }
    } else {
      console.warn("⚠️ WARRANTY NOTIFICATION - Could not determine store number, using fallback recipients");
      // Fallback: Brad Perry + submitting manager only
      recipients.push('bperry@conlantire.com');
      if (warrantyData.email) recipients.push(warrantyData.email);
    }
    
    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)];
    console.log("📧 WARRANTY NOTIFICATION - Final recipient list:", uniqueRecipients);
    
    if (uniqueRecipients.length === 0) {
      console.log("⚠️ WARRANTY NOTIFICATION - No email recipients found");
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients configured',
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

    console.log("📧 WARRANTY NOTIFICATION - Sending email via mailer to:", uniqueRecipients);
    console.log("📧 WARRANTY NOTIFICATION - Email subject:", emailSubject);
    
    // Send email via centralized mailer
    const emailResponse = await sendEmail({
      to: uniqueRecipients,
      subject: emailSubject,
      html: emailBody
    });

    if (!emailResponse.success) {
      console.error("❌ WARRANTY NOTIFICATION - Mailer failed:", emailResponse.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to send email: ${emailResponse.error}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("✅ WARRANTY NOTIFICATION - Email sent successfully via mailer");

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Warranty notification sent successfully',
      recipients: uniqueRecipients.length,
      store: warrantyData.store,
      warrantyId: warrantyId,
      plantCode: storeNumber ? getPlantCodeFromStore(storeNumber) : 'unknown',
      finalRecipients: uniqueRecipients
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("❌ WARRANTY NOTIFICATION - Error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
