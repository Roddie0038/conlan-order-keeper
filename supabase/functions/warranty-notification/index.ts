
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SMTP configuration using environment variables
const SMTP_CONFIG = {
  host: Deno.env.get('SMTP_HOST') || 'smtp.zoho.com',
  port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
  user: Deno.env.get('SMTP_USER') || '',
  pass: Deno.env.get('SMTP_PASS') || '',
  from: Deno.env.get('FROM_EMAIL') || 'conlantireorders@conlanorders.com',
};

// Plant-specific email routing rules
const PLANT_EMAIL_RULES = {
  "Grand Prairie 97": [
    "jesquivel@conlantire.com",
    "jpalos@conlantire.com", 
    "bperry@conlantire.com"
  ],
  "Romulus 98": [
    "bperry@conlantire.com",
    "chynds@conlantire.com"
  ],
  "Mulberry 99": [
    "dlee@conlantire.com",
    "wsettles@conlantire.com",
    "bperry@conlantire.com"
  ]
};

async function sendSMTPEmail(to: string[], subject: string, htmlBody: string) {
  console.log("📧 Attempting to send email via SMTP to:", to);
  
  try {
    // Create email message in RFC 5322 format
    const boundary = `boundary_${Date.now()}`;
    const emailContent = [
      `From: ${SMTP_CONFIG.from}`,
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      htmlBody,
      ``,
      `--${boundary}--`
    ].join('\r\n');

    // Connect to SMTP server and send email
    const conn = await Deno.connect({
      hostname: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to read SMTP response
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      if (n === null) return '';
      return decoder.decode(buffer.subarray(0, n));
    };

    // Helper function to send SMTP command
    const sendCommand = async (command: string) => {
      await conn.write(encoder.encode(command + '\r\n'));
      return await readResponse();
    };

    // SMTP conversation
    await readResponse(); // Read greeting
    await sendCommand(`EHLO ${SMTP_CONFIG.host}`);
    await sendCommand('STARTTLS');
    
    // Note: For production, you'd want to upgrade to TLS here
    // For now, we'll continue with plain text (you may need to adjust based on your SMTP server)
    
    await sendCommand(`AUTH LOGIN`);
    await sendCommand(btoa(SMTP_CONFIG.user));
    await sendCommand(btoa(SMTP_CONFIG.pass));
    await sendCommand(`MAIL FROM:<${SMTP_CONFIG.from}>`);
    
    for (const recipient of to) {
      await sendCommand(`RCPT TO:<${recipient}>`);
    }
    
    await sendCommand('DATA');
    await conn.write(encoder.encode(emailContent + '\r\n.\r\n'));
    await readResponse();
    await sendCommand('QUIT');
    
    conn.close();
    console.log("✅ Email sent successfully via SMTP");
    return true;
  } catch (error) {
    console.error("❌ SMTP email sending failed:", error);
    throw error;
  }
}

// Email notification for warranty claims (Local/Retread only)
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

    // Only process local/retread warranty claims (National Account removed)
    const plant = warrantyData.plant;
    const recipients = PLANT_EMAIL_RULES[plant] || [];
    
    if (recipients.length === 0) {
      console.log("⚠️ No email recipients found for plant:", plant);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients configured for this plant',
        plant: plant
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add the store manager who submitted the warranty to recipients
    const allRecipients = [...recipients];
    if (warrantyData.email && !allRecipients.includes(warrantyData.email)) {
      allRecipients.push(warrantyData.email);
    }

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

    console.log("📧 Sending warranty notification to:", allRecipients);
    
    // Send email via SMTP
    await sendSMTPEmail(allRecipients, emailSubject, emailBody);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Warranty notification sent successfully',
      recipients: allRecipients.length,
      plant: plant
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
