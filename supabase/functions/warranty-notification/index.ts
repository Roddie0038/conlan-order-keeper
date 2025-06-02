
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email notification for warranty claims
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
    const { warrantyData, warrantyId } = await req.json();
    console.log("📧 Processing warranty notification:", warrantyId);

    // Determine RDO email based on plant
    const rdoEmailMap: { [key: string]: string } = {
      "Grand Prairie 97": "gp-rdo@conlantire.com",
      "San Antonio 95": "sa-rdo@conlantire.com",
      "Houston 98": "hou-rdo@conlantire.com",
      "Austin 99": "aus-rdo@conlantire.com",
      "Corpus Christi 96": "cc-rdo@conlantire.com"
    };

    const rdoEmail = rdoEmailMap[warrantyData.plant] || "rdo@conlantire.com";
    
    // Email recipients
    const recipients = [
      "javier@conlantire.com",
      "angel@conlantire.com", 
      "kyle@conlantire.com",
      rdoEmail
    ];

    console.log("📧 Sending warranty notification to:", recipients);

    // Format email content
    const emailSubject = `Retread Warranty Claim - ${warrantyData.customer_name} - ${warrantyData.work_order}`;
    
    const emailBody = `
      <h2>New Retread Warranty Claim Submitted</h2>
      
      <h3>Claim Details:</h3>
      <ul>
        <li><strong>Customer Name:</strong> ${warrantyData.customer_name}</li>
        <li><strong>Store:</strong> ${warrantyData.store}</li>
        <li><strong>Plant:</strong> ${warrantyData.plant}</li>
        <li><strong>Work Order #:</strong> ${warrantyData.work_order}</li>
        <li><strong>DOT Number:</strong> ${warrantyData.dot_number}</li>
        <li><strong>Tire Size:</strong> ${warrantyData.tire_size || 'Not specified'}</li>
        <li><strong>Condition/Reason:</strong> ${warrantyData.condition}</li>
        <li><strong>Submitted by:</strong> ${warrantyData.name} (${warrantyData.email})</li>
      </ul>

      <h3>Additional Information:</h3>
      <p><strong>Notes:</strong> ${warrantyData.notes || 'None'}</p>
      
      <h3>Attachments:</h3>
      <p><strong>Invoice:</strong> <a href="${warrantyData.invoice_url}">View Invoice</a></p>
      
      ${warrantyData.photo_urls && warrantyData.photo_urls.length > 0 ? `
        <p><strong>Tire Photos:</strong></p>
        <ul>
          ${warrantyData.photo_urls.map((url: string, index: number) => 
            `<li><a href="${url}">Photo ${index + 1}</a></li>`
          ).join('')}
        </ul>
      ` : '<p><strong>Tire Photos:</strong> None uploaded</p>'}

      <hr>
      <p><em>This warranty claim has been assigned ID: ${warrantyId}</em></p>
      <p><em>Please review and process within 2 weeks as per Local Book policy.</em></p>
    `;

    // In a real implementation, you would use a service like Resend
    // For now, we'll just log the email content
    console.log("✅ Email content prepared:");
    console.log("Subject:", emailSubject);
    console.log("Recipients:", recipients);
    console.log("Body length:", emailBody.length);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Warranty notification processed',
      recipients: recipients.length 
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
